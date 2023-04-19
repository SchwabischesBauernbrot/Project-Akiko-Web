import datetime
from functools import wraps
import io
from flask import Flask, jsonify, request, render_template_string, abort, send_file, send_from_directory
from flask_cors import CORS, cross_origin
import argparse
import requests
import unicodedata
import time
from glob import glob
import json
import os
from PIL import Image, PngImagePlugin
import base64
from io import BytesIO
from pathlib import Path
from random import randint
from werkzeug.utils import secure_filename
from colorama import Fore, Style, init as colorama_init
import openai
import whisper
import azure.cognitiveservices.speech as speechsdk
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesisOutputFormat, SpeechSynthesizer
from azure.cognitiveservices.speech.audio import AudioOutputConfig

colorama_init()
# Constants
# Also try: 'Qiliang/bart-large-cnn-samsum-ElectrifAi_v10'
DEFAULT_SUMMARIZATION_MODEL = 'Qiliang/bart-large-cnn-samsum-ChatGPT_v3'
# Also try: 'joeddav/distilbert-base-uncased-go-emotions-student'
DEFAULT_CLASSIFICATION_MODEL = 'bhadresh-savani/distilbert-base-uncased-emotion'
# Also try: 'Salesforce/blip-image-captioning-base' or 'microsoft/git-large-r-textcaps'
DEFAULT_CAPTIONING_MODEL = 'Salesforce/blip-image-captioning-large'
DEFAULT_KEYPHRASE_MODEL = 'ml6team/keyphrase-extraction-distilbert-inspec'
DEFAULT_TEXT_MODEL = 'PygmalionAI/pygmalion-6b'

#ALL_MODULES = ['caption', 'summarize', 'classify', 'keywords', 'prompt', 'text', 'sd']
DEFAULT_SUMMARIZE_PARAMS = {
    'temperature': 1.0,
    'repetition_penalty': 1.0,
    'max_length': 500,
    'min_length': 200,
    'length_penalty': 1.5,
    'bad_words': ["\n", '"', "*", "[", "]", "{", "}", ":", "(", ")", "<", ">", "Â"]
}
DEFAULT_TEXT_PARAMS = {
    'do_sample': True,
    'max_length':2048,
    'use_cache':True,
    'min_new_tokens':10,
    'temperature':0.71,
    'repetition_penalty':1.01,
    'top_p':0.9,
    'top_k':40,
    'typical_p':1,
    'repetition_penalty': 1,
    'num_beams': 1,
    'penalty_alpha': 0,
    'length_penalty': 1,
    'no_repeat_ngram_size': 0,
    'early_stopping': False,
}
class SplitArgs(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, values.replace('"', '').replace("'", '').split(','))

# Script arguments
parser = argparse.ArgumentParser(
    prog='Project Akiko', description='Web API for transformers models')
parser.add_argument('--port', type=int,
                    help="Specify the port on which the application is hosted")
parser.add_argument('--listen', action='store_true',
                    help="Host the app on the local network")
parser.add_argument('--share', action='store_true',
                    help="Share the app on CloudFlare tunnel")
parser.add_argument('--cpu', action='store_true',
                    help="Run the models on the CPU")
parser.add_argument('--summarization-model',
                    help="Load a custom summarization model")
parser.add_argument('--classification-model',
                    help="Load a custom text classification model")
parser.add_argument('--captioning-model',
                    help="Load a custom captioning model")
parser.add_argument('--keyphrase-model',
                    help="Load a custom keyphrase extraction model")
parser.add_argument('--sd-cpu',
                    help="Force the SD pipeline to run on the CPU")
parser.add_argument('--text-model',
                    help="Load a custom text generation model")
parser.add_argument('--enable-modules', action=SplitArgs, default=[],
                    help="Override a list of enabled modules")

args = parser.parse_args()

port = args.port if args.port else 5100
host = '0.0.0.0' if args.listen else 'localhost'
summarization_model = args.summarization_model if args.summarization_model else DEFAULT_SUMMARIZATION_MODEL
classification_model = args.classification_model if args.classification_model else DEFAULT_CLASSIFICATION_MODEL
captioning_model = args.captioning_model if args.captioning_model else DEFAULT_CAPTIONING_MODEL
keyphrase_model = args.keyphrase_model if args.keyphrase_model else DEFAULT_KEYPHRASE_MODEL
text_model = args.text_model if args.text_model else DEFAULT_TEXT_MODEL
modules = args.enable_modules if args.enable_modules and len(args.enable_modules) > 0 else []

if len(modules) == 0:
    print(f'{Fore.RED}{Style.BRIGHT}You did not select any modules to run! Choose them by adding an --enable-modules option')
    print(f'Example: --enable-modules=caption,summarize{Style.RESET_ALL}')
    
if(len(modules) != 0):
    # Import modules
    from transformers import AutoTokenizer, AutoProcessor, pipeline
    from transformers import AutoModelForCausalLM, AutoModelForSeq2SeqLM
    from transformers import BlipForConditionalGeneration, GPT2Tokenizer
    import torch
    # Models init
    device_string = "cuda:0" if torch.cuda.is_available() and not args.cpu else "cpu"
    device = torch.device(device_string)
    torch_dtype = torch.float32 if device_string == "cpu" else torch.float16

if 'caption' in modules:
    print('Initializing an image captioning model...')
    captioning_processor = AutoProcessor.from_pretrained(captioning_model)
    if 'blip' in captioning_model:
        captioning_transformer = BlipForConditionalGeneration.from_pretrained(captioning_model, torch_dtype=torch_dtype).to(device)
    else:
        captioning_transformer = AutoModelForCausalLM.from_pretrained(captioning_model, torch_dtype=torch_dtype).to(device)

if 'summarize' in modules:
    print('Initializing a text summarization model...')
    summarization_tokenizer = AutoTokenizer.from_pretrained(summarization_model)
    summarization_transformer = AutoModelForSeq2SeqLM.from_pretrained(summarization_model, torch_dtype=torch_dtype).to(device)

if 'classify' in modules:
    print('Initializing a sentiment classification pipeline...')
    classification_pipe = pipeline("text-classification", model=classification_model, top_k=None, device=device, torch_dtype=torch_dtype)

if 'keywords' in modules:
    print('Initializing a keyword extraction pipeline...')
    import pipelines as pipelines
    keyphrase_pipe = pipelines.KeyphraseExtractionPipeline(keyphrase_model)

if 'text' in modules:
    print('Initializing a text generator')
    text_tokenizer = AutoTokenizer.from_pretrained(text_model)
    text_transformer = AutoModelForCausalLM.from_pretrained(text_model, torch_dtype=torch.float16).to(device)

# Flask init
app = Flask(__name__)
cors = CORS(app) # allow cross-domain requests
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
# Folder Locations
app.config['SETTINGS_FOLDER'] = '../frontend/src/shared_data/'
app.config['CONVERSATIONS_FOLDER'] = '../frontend/src/shared_data/conversations/'
app.config['CHARACTER_FOLDER'] = '../frontend/src/shared_data/character_info/'
app.config['CHARACTER_IMAGES_FOLDER'] = '../frontend/src/shared_data/character_images/'
app.config['USER_IMAGES_FOLDER'] = '../frontend/src/shared_data/user_avatars/'
app.config['CHARACTER_EXPORT_FOLDER'] = '../frontend/src/shared_data/exports/'
app.config['CHARACTER_ADVANCED_FOLDER'] = '../frontend/src/shared_data/advanced_characters/'
app.config['DEBUG'] = True
app.config['PROPAGATE_EXCEPTIONS'] = False
app.config['BACKGROUNDS_FOLDER'] = '../frontend/src/shared_data/backgrounds/'
app.config['AUDIO_OUTPUT'] = '../frontend/src/audio/'
app.config['GUIDE_FOLDER'] = '../frontend/src/guides/'
app.config['STT_FOLDER'] = '../frontend/src/stt/'

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'json'}

def import_tavern_character(img, char_id):
    _img = Image.open(io.BytesIO(img))
    _img.getexif()
    decoded_string = base64.b64decode(_img.info['chara'])
    _json = json.loads(decoded_string)
    print(_json)
    outfile_name = f'{str(char_id)}'
    _json = {"char_id": char_id, "name": _json['name'], "description": _json['description'], 'personality': _json['personality'], "first_mes": _json["first_mes"], "mes_example": _json["mes_example"], "scenario": _json["scenario"], "avatar": f'{outfile_name}.png'}
    with open(os.path.join(app.config['CHARACTER_FOLDER'],f'{outfile_name}.json'), 'w') as f:
        f.write(json.dumps(_json))
    return _json

def export_tavern_character(char_id):
    outfile_name = f'{str(char_id)}'
    with open(os.path.join(app.config['CHARACTER_FOLDER'], f'{outfile_name}.json'), 'r') as f:
        character_info = json.load(f)

    # Create a dictionary containing the character information to export
    reverted_char_data = {
        'name': character_info['name'],
        'description': character_info['description'],
        'personality': character_info['personality'],
        'scenario': character_info["scenario"],
        'first_mes': character_info["first_mes"],
        'mes_example': character_info["mes_example"],
        'metadata': {
            'version': '1.0.0',
            'editor': 'ProjectAkiko',
            'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }

    # Load the image in any format
    image = Image.open(os.path.join(app.config['CHARACTER_IMAGES_FOLDER'], f'{outfile_name}.png')).convert('RGBA')

    # Convert the dictionary to a JSON string and then encode as base64
    json_data = json.dumps(reverted_char_data)
    base64_encoded_data = base64.b64encode(json_data.encode('utf8')).decode('utf8')

    # Add the encoded data to the image metadata
    img_info = PngImagePlugin.PngInfo()
    img_info.add_text('chara', base64_encoded_data)

    # Save the modified image to the target location
    with open(os.path.join(app.config['CHARACTER_EXPORT_FOLDER'], f'{outfile_name}.png'), 'wb') as f:
        image.save(f, format='PNG', pnginfo=img_info)

    return

def export_new_character(character):
    outfile_name = f"{character['name']}.AkikoCharaCard"

    # Create a dictionary containing the character information to export
    character_data = {
        'name': character['name'],
        'description': character['description'],
        'personality': character['personality'],
        'scenario': character['scenario'],
        'first_mes': character['first_mes'],
        'mes_example': character['mes_example'],
        'metadata': {
            'version': '1.0.0',
            'editor': 'ProjectAkiko',
            'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }

    # Load the image in any format
    if character['avatar'] is not None:
        image = Image.open(character['avatar']).convert('RGBA')
    else:
        # Load a default image if avatar is not provided
        image = Image.open(os.path.join(app.config['CHARACTER_IMAGES_FOLDER'], 'default.png')).convert('RGBA')

    # Convert the dictionary to a JSON string and then encode as base64
    json_data = json.dumps(character_data)
    base64_encoded_data = base64.b64encode(json_data.encode('utf8')).decode('utf8')

    # Add the encoded data to the image metadata
    img_info = PngImagePlugin.PngInfo()
    img_info.add_text('chara', base64_encoded_data)

    # Save the modified image to the target location
    with open(os.path.join(app.config['CHARACTER_EXPORT_FOLDER'], f'{outfile_name}.png'), 'wb') as f:
        image.save(f, format='PNG', pnginfo=img_info)
    return

def export_as_json(character):
    # Create a dictionary containing the character information to export
    character_data = {
        'name': character['name'],
        'description': character['description'],
        'personality': character['personality'],
        'scenario': character['scenario'],
        'first_mes': character['first_mes'],
        'mes_example': character['mes_example'],
        'metadata': {
            'version': '1.0.0',
            'editor': 'ProjectAkiko',
            'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    }

    # Convert the dictionary to a JSON string
    json_data = json.dumps(character_data)

    return json_data

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def require_module(name):
    def wrapper(fn):
        @wraps(fn)
        def decorated_view(*args, **kwargs):
            if name not in modules:
                abort(403, 'Module is disabled by config')
            return fn(*args, **kwargs)
        return decorated_view
    return wrapper


# AI stuff
def classify_text(text: str) -> list:
    output = classification_pipe(text)[0]
    return sorted(output, key=lambda x: x['score'], reverse=True)


def caption_image(raw_image: Image, max_new_tokens: int = 20) -> str:
    inputs = captioning_processor(raw_image.convert('RGB'), return_tensors="pt").to(device, torch_dtype)
    outputs = captioning_transformer.generate(**inputs, max_new_tokens=max_new_tokens)
    caption = captioning_processor.decode(outputs[0], skip_special_tokens=True)
    return caption


def summarize(text: str, params: dict) -> str:
    # Tokenize input
    inputs = summarization_tokenizer(text, return_tensors="pt").to(device)
    token_count = len(inputs[0])

    bad_words_ids = [
        summarization_tokenizer(bad_word, add_special_tokens=False).input_ids
        for bad_word in params['bad_words']
    ]
    summary_ids = summarization_transformer.generate(
        inputs["input_ids"],
        num_beams=2,
        min_length=min(token_count, int(params['min_length'])),
        max_length=max(token_count, int(params['max_length'])),
        repetition_penalty=float(params['repetition_penalty']),
        temperature=float(params['temperature']),
        length_penalty=float(params['length_penalty']),
        bad_words_ids=bad_words_ids,
    )
    summary = summarization_tokenizer.batch_decode(
        summary_ids, skip_special_tokens=True, clean_up_tokenization_spaces=True
    )[0]
    summary = normalize_string(summary)
    return summary


def normalize_string(input: str) -> str:
    output = " ".join(unicodedata.normalize("NFKC", input).strip().split())
    return output


def extract_keywords(text: str) -> list:
    punctuation = '(){}[]\n\r<>'
    trans = str.maketrans(punctuation, ' '*len(punctuation))
    text = text.translate(trans)
    text = normalize_string(text)
    return list(keyphrase_pipe(text))

def generate_text(prompt: str, settings: dict) -> str:
    input_ids = text_tokenizer.encode(prompt, return_tensors="pt").to(device)
    attention_mask = torch.ones_like(input_ids)
    output = text_transformer.generate(
        input_ids,
        max_length=int(settings['max_length']),
        do_sample=settings['do_sample'],
        use_cache=settings['use_cache'],
        typical_p=float(settings['typical_p']),
        penalty_alpha=float(settings['penalty_alpha']),
        min_new_tokens=int(settings['min_new_tokens']),
        temperature=float(settings['temperature']),
        length_penalty=float(settings['length_penalty']),
        early_stopping=settings['early_stopping'],
        repetition_penalty=float(settings['repetition_penalty']),
        num_beams=int(settings['num_beams']),
        top_p=float(settings['top_p']),
        top_k=int(settings['top_k']),
        no_repeat_ngram_size=float(settings['no_repeat_ngram_size']),
        attention_mask=attention_mask,
        pad_token_id=text_tokenizer.pad_token_id,
        )
    if output is not None:
        generated_text = text_tokenizer.decode(output[0], skip_special_tokens=True)
        prompt_lines  = [line.strip() for line in str(prompt).split("\n")]
        response_lines  = [line.strip() for line in str(generated_text).split("\n")]
        new_amt = (len(response_lines) - len(prompt_lines)) + 1
        closest_lines = response_lines[-new_amt:]
        last_line = prompt_lines[-1]
        if last_line:
            last_line_words = last_line.split()
            if len(last_line_words) > 0:
                filter_word = last_line_words[0]
                closest_lines[0] = closest_lines[0].replace(filter_word, '', 1).lstrip()
                result_text = "\n".join(closest_lines)
        results = {"text" : result_text}
        return results
    else:
        return {'text': "This is an empty message. Something went wrong. Please check your code!"}
    
def synthesize_speech(ssml_string, speech_key, service_region):
    for filename in os.listdir(app.config['AUDIO_OUTPUT']):
        if not filename.startswith('bettercallsen'):
            os.remove(os.path.join(app.config['AUDIO_OUTPUT'], filename))
    print("Synthesizing speech...")
    # Create an instance of a speech config with specified subscription key and service region.
    # Set up the Azure Speech Config with your subscription key and region
    speech_config = SpeechConfig(subscription=speech_key, region=service_region)
    # Set the desired output audio format
    speech_config.set_speech_synthesis_output_format(SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3)
    # Get the current time to use as the file name
    current_time = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    # Set the output path for the speech file
    output_path = os.path.join(app.config['AUDIO_OUTPUT'], f'{current_time}.mp3')
    # Create an AudioConfig for saving the synthesized speech to a file
    audio_output = AudioOutputConfig(filename=output_path)
    
    # Create a Speech Synthesizer with the Speech Config and Audio Output Config
    synthesizer = SpeechSynthesizer(speech_config=speech_config, audio_config=audio_output)

    # Synthesize the speech using the SSML string
    result = synthesizer.speak_ssml_async(ssml_string).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized successfully.")
        return f'{current_time}.mp3'
    elif result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = result.cancellation_details
        print("Speech synthesis canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details: {}".format(cancellation_details.error_details))

def stt_transcribe(filepath):
    model = whisper.load_model("base")
    audio = whisper.load_audio(filepath)
    audio = whisper.pad_or_trim(audio)

    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    _, probs = model.detect_language(mel)

    options = whisper.DecodingOptions()
    result = whisper.decode(model, mel, options)

    return result.text


################################
##### START OF CORE ROUTES #####
################################


@app.before_request
# Request time measuring
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    duration = time.time() - request.start_time
    response.headers['X-Request-Duration'] = str(duration)
    return response

@app.errorhandler(400)
def handle_bad_request(e):
    return jsonify(error=str(e)), 400

@app.route('/api/caption', methods=['POST'])
@require_module('caption')
def api_caption():
    data = request.get_json()

    if 'image' not in data or not isinstance(data['image'], str):
        abort(400, '"image" is required')

    image = Image.open(BytesIO(base64.b64decode(data['image'])))
    caption = caption_image(image)
    return jsonify({'caption': caption})


@app.route('/api/summarize', methods=['POST'])
@require_module('summarize')
def api_summarize():
    data = request.get_json()

    if 'text' not in data or not isinstance(data['text'], str):
        abort(400, '"text" is required')

    params = DEFAULT_SUMMARIZE_PARAMS.copy()

    if 'params' in data and isinstance(data['params'], dict):
        params.update(data['params'])

    summary = summarize(data['text'], params)
    return jsonify({'summary': summary})


@app.route('/api/classify', methods=['POST'])
@require_module('classify')
def api_classify():
    data = request.get_json()

    if 'text' not in data or not isinstance(data['text'], str):
        abort(400, '"text" is required')

    classification = classify_text(data['text'])
    return jsonify({'classification': classification})


@app.route('/api/classify/labels', methods=['GET'])
@require_module('classify')
def api_classify_labels():
    classification = classify_text('')
    labels = [x['label'] for x in classification]
    return jsonify({'labels': labels})


@app.route('/api/keywords', methods=['POST'])
@require_module('keywords')
def api_keywords():
    data = request.get_json()

    if 'text' not in data or not isinstance(data['text'], str):
        abort(400, '"text" is required')

    keywords = extract_keywords(data['text'])
    return jsonify({'keywords': keywords})


@app.route('/api/discord-bot/config', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_discord_bot_config():
    # Read the .config file if it exists, otherwise return default values
    if os.path.isfile('.config'):
        with open('.config', 'r') as config_file:
            lines = config_file.readlines()
            for line in lines:
                if line.startswith('DISCORD_BOT_TOKEN='):
                    bot_token = line.strip().split('=')[1].strip('"')
                elif line.startswith('CHANNEL_ID='):
                    channels = line.strip().split('=')[1].strip('"')
    else:
        bot_token = 'default_bot_token'
        channels = 'default_channel_id'

    return jsonify({
        'botToken': bot_token,
        'channels': channels
    }), 200




##############################
##### END OF CORE ROUTES #####
##############################

#################################
##### TEXT GEN API HANDLING #####
#################################

HORDE_API_URL = 'https://aihorde.net/api/'

@app.route('/api/textgen/<endpointType>', methods=['POST'])
@cross_origin()
def textgen(endpointType):
    data = request.get_json()
    endpoint = data['endpoint']
    configuredName = data['configuredName']
    if(data['endpoint'].endswith('/')): endpoint = data['endpoint'][:-1]
    if(data['endpoint'].endswith('/api')): endpoint = data['endpoint'][:-4]
    if(endpointType == 'Kobold'):
        # Update the payload for the Kobold endpoint
        payload = {'prompt': data['prompt'], **data['settings']}
        response = requests.post(f"{endpoint}/api/v1/generate", json=payload)
        if response.status_code == 200:
            # Get the results from the response
            results = response.json()
            return jsonify(results)
        
    elif(endpointType == 'Ooba'):
        params = {
            'prompt': data['prompt'],
        }
        prompt = data['prompt']
        payload = json.dumps([prompt, params])

        # Send a request to the Ooba endpoint with the payload
        response = requests.post(f"{endpoint}/run/textgen", json={
            "data": [
                payload
            ]
        }).json()
        # Extract the raw reply from the response
        raw_reply = response["data"][0]
        print("Raw reply:", raw_reply)
        response_half = raw_reply.split(data['prompt'])[1]
        print(response_half)
        return jsonify(response_half)



    elif(endpointType == 'OAI'):
        OPENAI_API_KEY = data['endpoint']
        openai.api_key = OPENAI_API_KEY
        response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": data['prompt']}
        ],
            max_tokens=data['settings']['max_tokens'],
            n=1,
            stop=f'{configuredName}:',
            temperature=data['settings']['temperature'],
        )
        if response.choices:
            response = response['choices'][0]['message']['content']
            print(response)
            results = {'results': [response]}
            return jsonify(results)
        else:
            print('There was no response.')
    elif(endpointType == 'Horde'):
        if(data['endpoint'] == ''):
            api_key = 0000000000
        else:
            api_key = data['endpoint']
        payload = {"prompt": data['prompt'], "params": data['settings'], "models": [data['hordeModel']]}
        response = requests.post(
                HORDE_API_URL + f"v2/generate/text/async",
                headers={"Content-Type": "application/json", "apikey": api_key},
                data=json.dumps(payload)
            )
        task_id = json.loads(response.content.decode("utf-8"))['id']
        while True:
                time.sleep(5)
                status_check = requests.get(
                    HORDE_API_URL + f"v2/generate/text/status/{task_id}", 
                    headers={"Content-Type": "application/json", "apikey": data['endpoint']}
                )
                status_check_json = json.loads(status_check.content.decode("utf-8"))
                print(status_check_json)
                if status_check_json.get('done') == True:
                    get_text = requests.get(
                    HORDE_API_URL + f"v2/generate/text/status/{task_id}", 
                    headers={"Content-Type": "application/json", "apikey": data['endpoint']}
                    )
                    text_response_json = json.loads(get_text.content.decode("utf-8"))
                    generated_text = text_response_json['generations'][0]
                    results = {'results': [generated_text]}
                    return jsonify(results)
    elif(endpointType == 'AkikoBackend'):
        results = {'results': [generate_text(data['prompt'], data['settings'])]}
        return jsonify(results)
    return jsonify({'error': 'Invalid endpoint type or endpoint.'}), 404

@app.route('/api/textgen/status', methods=['POST'])
@cross_origin()
def textgen_status():
    data = request.get_json()
    endpoint = data['endpoint']
    endpointType = data['endpointType']
    if(data['endpoint'].endswith('/')): endpoint = data['endpoint'][:-1]
    if(endpointType == 'Kobold'):
        try:
            response = requests.get(f"{endpoint}/api/v1/model")
            if response.status_code == 200:
                results = response.json()
                return jsonify(results)
        except:
            return jsonify({'error': 'Kobold endpoint is not responding.'}), 404
    elif(endpointType == 'Ooba'):
        return jsonify({'error': 'Ooba is not yet supported.'}), 500
    elif(endpointType == 'OAI'):
        return jsonify({'error': 'OAI is not yet supported.'}), 500
    elif(endpointType == 'Horde'):
        response = requests.get(HORDE_API_URL + f"v2/status/heartbeat")
        if response.status_code == 200:
            return jsonify({'result': 'Horde heartbeat is steady.'})
        return jsonify({'error': 'Horde heartbeat failed.'}), 500
    elif(endpointType == 'AkikoBackend'):
        if(torch.cuda.is_available()):
            results = {'result': text_model}
        else:
            results = {'error': 'No Torch detected.'}
        return jsonify(results)

##############################################
##### END OF TXT GEN API HANDLING ROUTES #####
##############################################


##################################
##### BASIC CHARACTER ROUTES #####
##################################


@app.route('/api/characters', methods=['GET'])
@cross_origin()
def get_characters():
    characters = []
    # loop through all the character files and load the data
    for filename in os.listdir(app.config['CHARACTER_FOLDER']):
        if filename.endswith('.json'):
            with open(os.path.join(app.config['CHARACTER_FOLDER'], filename)) as f:
                character_data = json.load(f)
                characters.append(character_data)
    # return the list of characters as a JSON response
    return jsonify(characters)


@app.route('/api/characters', methods=['POST'])
@cross_origin()
def add_character():
    # Get the character information from the request
    fields = {
        'char_id': 'char_id',
        'name': 'name',
        'personality': 'personality',
        'description': 'description',
        'scenario': 'scenario',
        'first_mes': 'first_mes',
        'mes_example': 'mes_example'
    }
    avatar = None

    # Use request.files.get() to avoid KeyError
    if(request.files.get('avatar') is not None):
        avatar = request.files['avatar']
        # Check if a file was uploaded and if it's allowed
        if avatar and allowed_file(avatar.filename):
            # Save the file with a secure filename
            filename = secure_filename(str(request.form.get('char_id')) + '.png')
            avatar.save(os.path.join(app.config['CHARACTER_IMAGES_FOLDER'], filename))
            # Add the file path to the character information
            avatar = filename

    # Save the character information to a JSON file
    character = {field_value: request.form.get(field_key) for field_key, field_value in fields.items()}
    character['avatar'] = avatar
    if(avatar is None):
        character['avatar'] = 'default.png'
    print(character['avatar'])
    with open(os.path.join(app.config['CHARACTER_FOLDER'], f"{character['char_id']}.json"), 'a') as f:
        f.write(json.dumps(character))

    return jsonify(character)


@app.route('/api/characters/<char_id>', methods=['GET'])
@cross_origin()
def get_character(char_id):
    character_path = app.config['CHARACTER_FOLDER'] + str(char_id) + '.json'
    try:
        with open(character_path) as f:
            character_data = json.load(f)
    except FileNotFoundError:
        return jsonify({'error': 'Character not found'}), 404
    return jsonify(character_data)


@app.route('/api/characters/<char_id>', methods=['DELETE'])
@cross_origin()
def delete_character(char_id):
    advanced_character_folder = app.config['CHARACTER_ADVANCED_FOLDER'] + str(char_id)
    character_path = app.config['CHARACTER_FOLDER'] + str(char_id) + '.json'
    image_path = app.config['CHARACTER_IMAGES_FOLDER'] + str(char_id) + '.png'
    try:
        os.remove(character_path)
        if(os.path.exists(advanced_character_folder)):
            shutil.rmtree(advanced_character_folder)
            os.remove(advanced_character_folder)
        if(os.path.exists(image_path)):
            os.remove(image_path)
        else:
            print('No non-default image found for character ' + str(char_id))
    except FileNotFoundError:
        return jsonify({'error': 'Character not found'}), 404
    return jsonify({'message': 'Character deleted successfully'})


@app.route('/api/characters/<char_id>', methods=['PUT'])
@cross_origin()
def update_character(char_id):
    # Get the character information from the request
    fields = {
        'name': 'name',
        'personality': 'personality',
        'description': 'description',
        'scenario': 'scenario',
        'first_mes': 'first_mes',
        'mes_example': 'mes_example'
    }
    
    avatar = request.files.get('avatar')
    
    # Check if a file was uploaded and if it's allowed
    if avatar and allowed_file(avatar.filename):
        # Save the file with a secure filename
        filename = secure_filename(str(char_id) + '.png')
        avatar.save(os.path.join(app.config['CHARACTER_IMAGES_FOLDER'], filename))
        # Add the file path to the character information
        avatar = filename

    # Load the existing character information from the JSON file
    character_path = os.path.join(app.config['CHARACTER_FOLDER'], f'{char_id}.json')

    try:
        with open(character_path, 'r') as f:
            character = json.load(f)
    except FileNotFoundError:
        return jsonify({'error': 'Character not found'}), 404

    # Update the character information
    for field_key, field_value in fields.items():
        if request.form.get(field_key):
            character[field_value] = request.form.get(field_key)

    if avatar:
        character['avatar'] = avatar

    # Save the updated character information to the JSON file
    with open(character_path, 'w') as f:
        json.dump(character, f)

    return jsonify({'message': 'Character updated successfully', 'avatar': avatar})


#########################################
##### END OF BASIC CHARACTER ROUTES #####
#########################################


############################
#### COVERSATION ROUTES ####
############################


@app.route('/api/conversation', methods=['POST'])
@cross_origin()
def save_conversation():
    conversation_data = request.get_json()

    chatName = conversation_data['conversationName']
    
    # Create the 'conversations' directory if it doesn't exist
    if not os.path.exists(app.config['CONVERSATIONS_FOLDER']):
        os.makedirs(app.config['CONVERSATIONS_FOLDER'])
    file_path = app.config['CONVERSATIONS_FOLDER'] + str(chatName) + '.json'
    try:
        with open(file_path, 'w') as file:
            json.dump(conversation_data, file)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        print(f"Error saving conversation: {str(e)}")
        return jsonify({'status': 'error', 'message': 'An error occurred while saving the conversation.'}), 500


@app.route('/api/conversations', methods=['GET'])
@cross_origin()
def get_conversation_names():
    conversations_folder = app.config['CONVERSATIONS_FOLDER']
    if not os.path.exists(conversations_folder):
        return jsonify({"conversations": []})
    conversation_files = os.listdir(conversations_folder)
    conversation_names = [os.path.splitext(file)[0] for file in conversation_files]
    return jsonify({"conversations": conversation_names})


@app.route('/api/conversation/<conversation_name>', methods=['GET', 'DELETE'])
@cross_origin()
def conversation(conversation_name):
    convo_path = os.path.join(app.config['CONVERSATIONS_FOLDER'], f'{conversation_name}.json')

    if request.method == 'DELETE':
        try:
            os.remove(convo_path)
            return jsonify({'message': 'Conversation deleted successfully'})
        except FileNotFoundError:
            return jsonify({'error': 'Conversation not found'}), 404

    try:
        with open(convo_path) as f:
            convo_data = json.load(f)
        return jsonify(convo_data)
    except FileNotFoundError:
        return jsonify({'error': 'Conversation not found'}), 404
    

###################################
#### END OF COVERSATION ROUTES ####
###################################


###############################
#### CHARACTER CARD ROUTES ####
###############################


@app.route('/api/tavern-character', methods=['POST'])
@cross_origin()
def upload_tavern_character():
    char_id = request.form.get('char_id')
    file = request.files['image']

    filename = None
    # Check if a file was uploaded and if it's allowed
    if file and allowed_file(file.filename):
        # Save the file with a secure filename
        filename = secure_filename(str(char_id) + os.path.splitext(file.filename)[-1])
        folder = app.config['CHARACTER_IMAGES_FOLDER'] if file.filename.lower().endswith('.png') else app.config['CHARACTER_FOLDER']
        file.save(os.path.join(folder, filename))
    try:
        if filename.lower().endswith('.png'):
            with open(os.path.join(app.config['CHARACTER_IMAGES_FOLDER'], filename), 'rb') as read_file:
                img = read_file.read()
                _json = import_tavern_character(img, char_id)
            read_file.close()
        elif filename.lower().endswith('.json'):
            with open(os.path.join(app.config['CHARACTER_FOLDER'], filename), 'r') as read_file:
                _json = json.load(read_file)
            read_file.close()
            _json['char_id'] = char_id
            _json['avatar'] = 'default.png'
            # Save the updated JSON back to the file
            with open(os.path.join(app.config['CHARACTER_FOLDER'], filename), 'w') as write_file:
                json.dump(_json, write_file)
            write_file.close()
    except Exception as e:
        print(f"Error saving character: {str(e)}")
        return jsonify({'error': 'Character card failed to import'}), 500
    return jsonify(_json)

@app.route('/api/tavern-character/new-export', methods=['POST'])
@cross_origin()
def download_new_character_card():
    fields = {
        'char_id': 'char_id',
        'name': 'name',
        'personality': 'personality',
        'description': 'description',
        'scenario': 'scenario',
        'first_mes': 'first_mes',
        'mes_example': 'mes_example'
    }
    avatar = None

    # Use request.files.get() to avoid KeyError
    if(request.files.get('avatar') is not None):
        avatar = request.files['avatar']
    
    character = {field_value: request.form.get(field_key) for field_key, field_value in fields.items()}
    character['avatar'] = avatar

    try:
        export_new_character(character)
    except Exception as e:
        print(f"Error saving character: {str(e)}")
        return jsonify({'error': 'Character card failed to export'}), 500
    return jsonify({'success': 'Character card exported'})


@app.route('/api/tavern-character/json-export', methods=['POST'])
@cross_origin()
def download_as_json():
    fields = {
        'char_id': 'char_id',
        'name': 'name',
        'personality': 'personality',
        'description': 'description',
        'scenario': 'scenario',
        'first_mes': 'first_mes',
        'mes_example': 'mes_example'
    }

    character = {field_value: request.form.get(field_key) for field_key, field_value in fields.items()}

    try:
        json_data = export_as_json(character)
    except Exception as e:
        print(f"Error saving character: {str(e)}")
        return jsonify({'error': 'Character JSON failed to export'}), 500

    # Prepare the JSON data for download
    json_bytes = json_data.encode('utf-8')
    buffer = io.BytesIO(json_bytes)
    outfile_name = f"{character['name']}.AkikoJSON.json"

    return send_file(buffer, mimetype='application/json', as_attachment=True, download_name=outfile_name)

@app.route('/api/tavern-character/<char_id>', methods=['GET'])
@cross_origin()
def download_tavern_character(char_id):
    try:
        export_tavern_character(char_id)
    except Exception as e:
        print(f"Error saving character: {str(e)}")
        return jsonify({'error': 'Character card failed to export'}), 500
    return jsonify({'success': 'Character card exported'})


######################################
#### END OF CHARACTER CARD ROUTES ####
######################################


###################################
#### ADVANCED CHARACTER ROUTES ####
###################################

from flask import request
import shutil

@app.route('/api/advanced-character/<char_id>/<emotion>', methods=['DELETE'])
@cross_origin()
def delete_advanced_emotion(char_id, emotion):
    emotion_path = os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/', f'{emotion}.png')
    default_path = os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/', f'default.png')

    if os.path.exists(emotion_path):
        os.remove(emotion_path)
        if emotion == 'default' and os.path.exists(default_path):
            # If the emotion is 'default', remove the default sprite as well
            os.remove(default_path)
        return jsonify({'success': f'Character emotion {emotion} deleted.'})
    else:
        return jsonify({'failure': f'Character does not have an image for the {emotion} emotion.'})

@app.route('/api/advanced-character/<char_id>/<emotion>', methods=['GET'])
@cross_origin()
def get_advanced_emotion(char_id, emotion):
    if(os.path.exists(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/', f'{emotion}.png'))):
        imagePath = os.path.join('/src/shared_data/advanced_characters/', f'{char_id}/', f'{emotion}.png')
        return jsonify({'success': 'Character emotion found', 'path': imagePath})
    elif(os.path.exists(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/', f'default.png'))):
        imagePath = os.path.join('/src/shared_data/advanced_characters/', f'{char_id}/', f'default.png')
        return jsonify({'failure': 'Character emotion not found, reverting to default', 'path': imagePath})
    else:
        return jsonify({'failure': 'Character does not have an image for this emotion.'})

@app.route('/api/advanced-character/<char_id>/<emotion>', methods=['POST'])
@cross_origin()
def save_advanced_emotion(char_id, emotion):
    # Get the emotion image file from the request object
    if(request.files.get('emotion') is None):
        return jsonify({'error': 'No emotion image file found'}), 500
    if(not os.path.exists(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/'))):
        os.mkdir(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/'))

    emotion_file = request.files['emotion']
    # Construct the new file name using the emotion name and extension
    emotion_file_name = f"{emotion}.png"
    # Save the image file to the character's folder with the new file name
    emotion_file.save(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], char_id, emotion_file_name))
    # Return the frontend path to the image file
    imagePath = os.path.join('/src/shared_data/advanced_characters/', f'{char_id}/', f'{emotion_file_name}')
    return jsonify({'path': imagePath})


@app.route('/api/advanced-character/<char_id>', methods=['GET'])
@cross_origin()
def get_advanced_emotions(char_id):
    if(os.path.exists(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/'))):
        emotions_with_ext = os.listdir(os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], f'{char_id}/'))
        emotions = [os.path.splitext(emotion)[0] for emotion in emotions_with_ext] # Remove the file extension from each emotion
        return jsonify({'success': 'Character emotions found', 'emotions': emotions})
    else:
        return jsonify({'failure': 'Character does not have any emotions.'})
    
@app.route('/api/synthesize_speech', methods=['POST'])
@cross_origin()
def synthesize_speech_route():
    data = request.get_json()
    ssml_string = data.get('ssml', None)
    speech_key = data.get('speech_key', None)
    service_region = data.get('service_region', None)
    if ssml_string and speech_key and service_region:
        fileName = synthesize_speech(ssml_string, speech_key, service_region)
        if(fileName == None):
            print("Speech synthesis failed.")
            return jsonify({"status": "error", "message": "Speech synthesis failed."}), 500
        else:
            print("Speech synthesized successfully.")
            return jsonify({"status": "success", "message": "Speech synthesized successfully.", 'audio': fileName}), 200
    else:
        print("Invalid input.")
        return jsonify({"status": "error", "message": "Invalid input."}), 500
    
@app.route('/api/character-speech/<char_id>', methods=['POST'])
@cross_origin()
def save_character_speech(char_id):
    character_speech = request.get_json()
    if character_speech is None:
        return jsonify({'error': 'No character speech data found'}), 500
    char_folder = os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], char_id)
    if not os.path.exists(char_folder):
        os.mkdir(char_folder)
    with open(os.path.join(char_folder, 'character_speech.json'), 'w') as f:
        json.dump(character_speech, f)
    return 'Character speech saved successfully!'

@app.route('/api/character-speech/<char_id>', methods=['GET'])
@cross_origin()
def get_character_speech(char_id):
    char_folder = os.path.join(app.config['CHARACTER_ADVANCED_FOLDER'], char_id)
    if not os.path.exists(char_folder):
        return jsonify({'error': 'Character folder not found'}), 404
    speech_file = os.path.join(char_folder, 'character_speech.json')
    if not os.path.exists(speech_file):
        return jsonify({'error': 'Speech file not found'}), 404
    with open(speech_file, 'r') as f:
        character_speech = json.load(f)
    return jsonify(character_speech)


##########################################
#### END OF ADVANCED CHARACTER ROUTES ####
##########################################


##############################
#### LAYOUT/DESIGN ROUTES ####
##############################


@app.route('/api/backgrounds', methods=['POST'])
@cross_origin()
def upload_background():
    if 'background' not in request.files:
        return {'error': 'No background file uploaded.'}, 400
    file = request.files['background']
    if file.filename == '':
        return {'error': 'No selected file.'}, 400
    filename = secure_filename(file.filename)
    if(os.path.exists(app.config['BACKGROUNDS_FOLDER'])):
        filepath = os.path.join(app.config['BACKGROUNDS_FOLDER'], filename)
        file.save(filepath)
        return {'filename': filename}, 200  # Return only the filename
    else:
        os.mkdir(app.config['BACKGROUNDS_FOLDER'])
        filepath = os.path.join(app.config['BACKGROUNDS_FOLDER'], filename)
        file.save(filepath)
        return {'filename': filename}, 200  # Return only the filename
    

@app.route('/api/backgrounds', methods=['GET'])
@cross_origin()
def get_backgrounds():
    if os.path.exists(app.config['BACKGROUNDS_FOLDER']):
        all_files = os.listdir(app.config['BACKGROUNDS_FOLDER'])
        img_files = [file for file in all_files if os.path.splitext(file)[1].lower() in ['.png', '.jpg']]
        return {'backgrounds': img_files}, 200
    else:
        return {'failure': 'No backgrounds found.'}, 404

@app.route('/api/backgrounds/<string:filename>', methods=['DELETE'])
@cross_origin()
def delete_background(filename):
    if not filename:
        return {'error': 'No filename provided.'}, 400

    # Check if the file exists
    filepath = os.path.join(app.config['BACKGROUNDS_FOLDER'], filename)
    if not os.path.exists(filepath):
        return {'error': f'File {filename} not found.'}, 404

    # Delete the file
    try:
        os.remove(filepath)
        return {'success': f'File {filename} deleted.'}, 200
    except Exception as e:
        return {'error': str(e)}, 500
    
#####################################
#### END OF LAYOUT/DESIGN ROUTES ####
#####################################


##############################
#### START OF USER ROUTES ####
##############################


@app.route('/api/user-avatar', methods=['POST'])
@cross_origin()
def save_user_avatar():
    if 'avatar' not in request.files:
        return 'No avatar file provided', 400

    avatar = request.files['avatar']

    if avatar.filename == '':
        return 'No selected file', 400
    # Count the number of avatar files in the folder
    avatar_count = len(os.listdir(app.config['USER_IMAGES_FOLDER']))
    # Save the avatar file to the user's folder
    avatar.save(os.path.join(app.config['USER_IMAGES_FOLDER'], f'{avatar_count}.png'))
    # Return a response to the client
    return {'avatar': f'{avatar_count}.png'}, 200

@app.route('/api/user-avatar', methods=['GET'])
@cross_origin()
def get_user_avatars():
    if os.path.exists(app.config['USER_IMAGES_FOLDER']):
        all_files = os.listdir(app.config['USER_IMAGES_FOLDER'])
        png_files = [file for file in all_files if os.path.splitext(file)[1].lower() == '.png']
        return jsonify({'success': 'User Avatars found', 'avatars': png_files})
    else:
        return jsonify({'failure': 'User Avatars not found.'})

#########################
#### SETTINGS ROUTES ####
#########################


@app.route('/api/modules', methods=['GET'])
@cross_origin()
def get_modules():
    return jsonify({'modules': modules})

@app.route('/api/settings', methods=['GET'])
@cross_origin()
def get_settings():
    settings_path = app.config['SETTINGS_FOLDER'] + 'settings.json'
    if(os.path.exists(settings_path)):
        with open(settings_path) as f:
            settngs_data = json.load(f)
        return jsonify(settngs_data)
    else:
        os.makedirs(app.config['SETTINGS_FOLDER'], exist_ok=True)
        with open(settings_path, 'w') as f:
            json.dump({'GeneralSettings' : [], 'GroupChatSettings' : [],  'EndpointSettings' : [], 'AvatarSettings' : [], 'MultiUserSettings' : []}, f)
        return jsonify({})

@app.route('/api/settings', methods=['POST'])
@cross_origin()
def save_settings():
    settings_path = app.config['SETTINGS_FOLDER'] + 'settings.json'
    with open(settings_path, 'w') as f:
        json.dump(request.json, f)
    return jsonify({'success': 'Settings saved'})


################################
#### END OF SETTINGS ROUTES ####
################################


#################################
##### START OF GUIDE ROUTES #####
#################################

@app.route('/api/guides', methods=['GET'])
@cross_origin()
def get_guides():
    guides = []
    for filename in os.listdir(app.config['GUIDE_FOLDER']):
        if filename.endswith('.json'):
            with open(os.path.join(app.config['GUIDE_FOLDER'], filename)) as f:
                guide = json.load(f)
                guides.append(guide)
    # return the list of characters as a JSON response
    return jsonify({'guides': guides})

@app.route('/api/guides', methods=['POST'])
@cross_origin()
def save_guide():
    guide = request.json
    filename_path = os.path.join(app.config['GUIDE_FOLDER'], f'{guide["id"]}.json')
    with open(filename_path, 'w') as f:
        json.dump(guide, f)
    return jsonify({'success': 'Guide saved'})

@app.route('/api/guides/<string:guide_id>', methods=['DELETE'])
@cross_origin()
def delete_guide(guide_id):
    filename_path = os.path.join(app.config['GUIDE_FOLDER'], f'{guide_id}.json')
    if os.path.exists(filename_path):
        os.remove(filename_path)
        return jsonify({'success': 'Guide deleted'})
    else:
        return jsonify({'failure': 'Guide not found'})

@app.route('/api/guides/<string:guide_id>', methods=['GET'])
@cross_origin()
def get_guide(guide_id):
    filename_path = os.path.join(app.config['GUIDE_FOLDER'], f'{guide_id}.json')
    if os.path.exists(filename_path):
        with open(filename_path) as f:
            guide = json.load(f)
            return jsonify({'success': 'Guide found', 'guide': guide})
    else:
        return jsonify({'failure': 'Guide not found'})


#################################
##### END OF GUIDE ROUTES #######
#################################

################################
##### START OF STT ROUTES ######
################################


@app.route('/api/stt', methods=['POST'])
@cross_origin()
def upload_audio():
    audio_file = request.files.get('audio')
    if audio_file:
        if(not os.path.exists(app.config['STT_FOLDER'])):
            os.makedirs(app.config['STT_FOLDER'])
        file_path = os.path.join(app.config['STT_FOLDER'], f'{audio_file.filename}.wav')
        audio_file.save(file_path)
        transcription = stt_transcribe(file_path)
        return {
            'message': 'Audio file uploaded and transcribed successfully.',
            'transcription': transcription
        }, 200
    else:
        return {'error': 'No audio file found in the request.'}, 400
    
if args.share:
    from flask_cloudflared import _run_cloudflared
    import inspect
    sig = inspect.signature(_run_cloudflared)
    sum = sum(1 for param in sig.parameters.values() if param.kind == param.POSITIONAL_OR_KEYWORD)
    if sum > 1:
        metrics_port = randint(8100, 9000)
        cloudflare = _run_cloudflared(port, metrics_port)
    else:
        cloudflare = _run_cloudflared(port)
    print("Running on", cloudflare)

app.run(host=host, port=port, debug=True)
