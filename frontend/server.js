import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { v4 as uuidv4 } from 'uuid';
import { Configuration, OpenAIApi } from "openai"; // use default import syntax
import extract from 'png-chunks-extract';
import PNGtext from 'png-chunk-text';
import encode from 'png-chunks-encode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });
const CHARACTER_FOLDER = './src/shared_data/character_info/';
const CHARACTER_IMAGES_FOLDER = './src/shared_data/character_images/';
const CHARACTER_ADVANCED_FOLDER = './src/shared_data/advanced_characters/';
const BACKGROUNDS_FOLDER = './src/shared_data/backgrounds/';
const USER_IMAGES_FOLDER = './src/shared_data/user_avatars/';
const AUDIO_OUTPUT = './src/audio/';
const HORDE_API_URL = 'https://aihorde.net/api/';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const CONVERSATIONS_FOLDER = './src/shared_data/conversations/';

function allowed_file(filename) {
    const allowed_extensions = ['png', 'jpg', 'jpeg', 'gif'];
    const extension = path.extname(filename).slice(1).toLowerCase();
    return allowed_extensions.includes(extension);
}
  
function secure_filename(filename) {
    return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', async (req, res) => {
    const viteServer = await createServer();
    const url = viteServer.url;

    res.redirect(url);
  });
}

// Signal handling
process.on('SIGINT', () => {
  console.log('Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/*
############################################
##                                        ##
##          CHARACTER ROUTES              ##
##                                        ##
############################################
*/

// GET /api/characters
app.get('/characters', (req, res) => {
    const characters = [];
  
    fs.readdirSync(CHARACTER_FOLDER).forEach((filename) => {
      if (filename.endsWith('.json')) {
        const characterData = JSON.parse(fs.readFileSync(path.join(CHARACTER_FOLDER, filename), 'utf-8'));
        characters.push(characterData);
      }
    });
  
    res.json(characters);
  });
  
  // POST /api/characters
app.post('/characters', upload.single('avatar'), (req, res) => {
    const fields = {
        char_id: 'char_id',
        name: 'name',
        personality: 'personality',
        description: 'description',
        scenario: 'scenario',
        first_mes: 'first_mes',
        mes_example: 'mes_example'
    };

    let avatar = null;
    if (req.file && allowed_file(req.file.filename)) {
        const filename = secure_filename(`${req.body.char_id}.png`);
        fs.renameSync(req.file.path, path.join(CHARACTER_IMAGES_FOLDER, filename));
        avatar = filename;
    }

    const character = Object.fromEntries(Object.entries(fields).map(([key, value]) => [value, req.body[key]]));
    character.avatar = avatar || 'default.png';

    fs.writeFileSync(path.join(CHARACTER_FOLDER, `${character.char_id}.json`), JSON.stringify(character));

    res.json(character);
});

// GET /api/characters/:char_id
app.get('/characters/:char_id', (req, res) => {
    const characterPath = path.join(CHARACTER_FOLDER, `${req.params.char_id}.json`);

    if (!fs.existsSync(characterPath)) {
        return res.status(404).json({ error: 'Character not found' });
    }

    const characterData = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
    res.json(characterData);
});

// DELETE /api/characters/:char_id
app.delete('/characters/:char_id', (req, res) => {
    const advancedCharacterFolder = path.join(CHARACTER_ADVANCED_FOLDER, req.params.char_id);
    const characterPath = path.join(CHARACTER_FOLDER, `${req.params.char_id}.json`);
    const imagePath = path.join(CHARACTER_IMAGES_FOLDER, `${req.params.char_id}.png`);
  
      if (!fs.existsSync(characterPath)) {
    return res.status(404).json({ error: 'Character not found' });
  }

  fs.unlinkSync(characterPath);
  if (fs.existsSync(advancedCharacterFolder)) {
    fs.rmSync(advancedCharacterFolder, { recursive: true, force: true });
  }
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  res.json({ message: 'Character deleted successfully' });
});

// PUT /api/characters/:char_id
app.put('/characters/:char_id', upload.single('avatar'), (req, res) => {
    const fields = {
      name: 'name',
      personality: 'personality',
      description: 'description',
      scenario: 'scenario',
      first_mes: 'first_mes',
      mes_example: 'mes_example'
    };
  
    const avatar = req.file && allowed_file(req.file.filename) ? req.file.filename : null;
  
    const characterPath = path.join(CHARACTER_FOLDER, `${req.params.char_id}.json`);
  
    if (!fs.existsSync(characterPath)) {
      return res.status(404).json({ error: 'Character not found' });
    }
  
    const character = JSON.parse(fs.readFileSync(characterPath, 'utf-8'));
  
    if (avatar) {
      const filename = secure_filename(`${req.params.char_id}.png`);
      fs.renameSync(req.file.path, path.join(CHARACTER_IMAGES_FOLDER, filename));
      character.avatar = filename;
    }
  
    Object.entries(fields).forEach(([key, value]) => {
      if (req.body[key]) {
        character[value] = req.body[key];
      }
    });
  
    fs.writeFileSync(characterPath, JSON.stringify(character));
  
    res.json({ message: 'Character updated successfully', avatar });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


/*
############################################
##                                        ##
##             TTS ROUTES                 ##
##                                        ##
############################################
*/
const ELEVENLABS_ENDPOINT = 'https://api.elevenlabs.io/v1';
// FETCH VOICE IDS
app.get('/tts/fetchvoices/', async (req, res) => {
  try {
    const response = await axios.get(`${ELEVENLABS_ENDPOINT}/voices`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ELEVENLABS_API_KEY,
      },
    });

    const voice_id = response.data.voices[0].voice_id;
    res.send(voice_id);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// STREAMING AUDIO
app.post('/tts/generate/:voice_id', async (req, res) => {
  try {
    const voice_id = req.params.voice_id;
    const prompt = req.params.prompt;
    const stability = req.params.stability;
    const similarity_boost = req.params.similarity_boost;

    const payload = {
      text: prompt,
      voice_settings: {
        stability: stability,
        similarity_boost: similarity_boost,
      },
    };

    const response = await axios.post(
      `${ELEVENLABS_ENDPOINT}/text-to-speech/${voice_id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
      }
    );

    const date = new Date();
    const fileName = `${date.getTime()}.mp3`;
    const audioFilePath = path.join(__dirname, fileName);
    fs.writeFileSync(audioFilePath, response.data);

    res.send(fileName);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/*
############################################
##                                        ##
##          Conversation ROUTES           ##
##                                        ##
############################################
*/

app.post('/conversation', (req, res) => {
  const conversationData = req.body;
  const chatName = conversationData.conversationName;

  if (!fs.existsSync(CONVERSATIONS_FOLDER)) {
      fs.mkdirSync(CONVERSATIONS_FOLDER);
  }
  const filePath = path.join(CONVERSATIONS_FOLDER, `${chatName}.json`);
  try {
      fs.writeFileSync(filePath, JSON.stringify(conversationData));
      res.status(200).json({ status: 'success' });
  } catch (e) {
      console.error(`Error saving conversation: ${e.toString()}`);
      res.status(500).json({ status: 'error', message: 'An error occurred while saving the conversation.' });
  }
});

app.get('/conversations', (req, res) => {
  if (!fs.existsSync(CONVERSATIONS_FOLDER)) {
      res.json({ conversations: [] });
      return;
  }
  const conversationFiles = fs.readdirSync(CONVERSATIONS_FOLDER);
  const conversationNames = conversationFiles.map(file => path.parse(file).name);
  res.json({ conversations: conversationNames });
});

app.route('/conversation/:conversation_name')
  .get((req, res) => {
      const convoPath = path.join(CONVERSATIONS_FOLDER, `${req.params.conversation_name}.json`);
      try {
          const convoData = JSON.parse(fs.readFileSync(convoPath));
          res.json(convoData);
      } catch (e) {
          if (e.code === 'ENOENT') {
              res.status(404).json({ error: 'Conversation not found' });
          } else {
              res.status(500).json({ error: 'An error occurred while reading the conversation.' });
          }
      }
  })
  .delete((req, res) => {
      const convoPath = path.join(CONVERSATIONS_FOLDER, `${req.params.conversation_name}.json`);
      try {
          fs.unlinkSync(convoPath);
          res.json({ message: 'Conversation deleted successfully' });
      } catch (e) {
          if (e.code === 'ENOENT') {
              res.status(404).json({ error: 'Conversation not found' });
          } else {
              res.status(500).json({ error: 'An error occurred while deleting the conversation.' });
          }
      }
  });

  async function import_tavern_character(img_url, char_id) {
    try {
      let format;
      if (img_url.indexOf('.webp') !== -1) {
        format = 'webp';
      } else {
        format = 'png';
      }
  
      let decoded_string;
      switch (format) {
        case 'webp':
          const exif_data = await ExifReader.load(fs.readFileSync(img_url));
          const char_data = exif_data['UserComment']['description'];
          if (char_data === 'Undefined' && exif_data['UserComment'].value && exif_data['UserComment'].value.length === 1) {
            decoded_string = exif_data['UserComment'].value[0];
          } else {
            decoded_string = char_data;
          }
          break;
        case 'png':
          const buffer = fs.readFileSync(img_url);
          const chunks = extract(buffer);
  
          const textChunks = chunks.filter(function (chunk) {
            return chunk.name === 'tEXt';
          }).map(function (chunk) {
            return PNGtext.decode(chunk.data);
          });
          decoded_string = Buffer.from(textChunks[0].text, 'base64').toString('utf8');
          break;
        default:
          break;
      }
  
      const _json = JSON.parse(decoded_string);
  
      const outfile_name = `${char_id}`;
      const characterData = {
        char_id: char_id,
        name: _json.name,
        description: _json.description,
        personality: _json.personality,
        first_mes: _json.first_mes,
        mes_example: _json.mes_example,
        scenario: _json.scenario,
        avatar: `${outfile_name}.png`,
      };
  
      // use fs.promises.writeFile to write the JSON file
      await fs.promises.writeFile(`${CHARACTER_FOLDER}${outfile_name}.json`, JSON.stringify(characterData));
  
      return characterData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
app.post('/tavern-character', upload.single('image'), async (req, res) => {
  const char_id = req.body.char_id;
  const file = req.file;

  let _json;

  try {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      // use fs.copyFile to copy the file from the temp folder to the destination folder
      const filename = secure_filename(`${char_id}.png`);
      const filepath = path.join(CHARACTER_IMAGES_FOLDER, filename);
      await fs.promises.copyFile(file.path, filepath);
      // import the tavern character from the image file
      _json = await import_tavern_character(file.path, char_id);
    } else if (file.mimetype === 'application/json') {
      _json = JSON.parse(await fs.promises.readFile(path.join(CHARACTER_FOLDER, file.filename), 'utf-8'));
      _json.char_id = char_id;
      _json.avatar = 'default.png';

      // Save the updated JSON back to the file
      await fs.promises.writeFile(path.join(CHARACTER_FOLDER, file.filename), JSON.stringify(_json));
    }
  } catch (error) {
    console.error(`Error saving character: ${error}`);
    return res.status(500).json({ error: 'Character card failed to import' });
  }

  res.json(_json);
});
/*
############################################
##                                        ##
##        Advanced Character ROUTES       ##
##                                        ##
############################################
*/

app.delete('/advanced-character/:char_id/:emotion', (req, res) => {
    const { char_id, emotion } = req.params;
    const emotion_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, `${emotion}.png`);
    const default_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, 'default.png');

    if (fs.existsSync(emotion_path)) {
        fs.unlinkSync(emotion_path);
        if (emotion === 'default' && fs.existsSync(default_path)) {
            fs.unlinkSync(default_path);
        }
        res.json({ success: `Character emotion ${emotion} deleted.` });
    } else {
        res.status(404).json({ failure: `Character does not have an image for the ${emotion} emotion.` });
    }
});

app.get('/advanced-character/:char_id/:emotion', (req, res) => {
    const { char_id, emotion } = req.params;
    const emotion_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, `${emotion}.png`);
    const default_path = path.join(CHARACTER_ADVANCED_FOLDER, char_id, 'default.png');

    if (fs.existsSync(emotion_path)) {
        const imagePath = path.join(CHARACTER_ADVANCED_FOLDER, char_id, `${emotion}.png`);
        res.json({ success: 'Character emotion found', path: imagePath });
    } else if (fs.existsSync(default_path)) {
        const imagePath = path.join(CHARACTER_ADVANCED_FOLDER, char_id, 'default.png');
        res.json({ failure: 'Character emotion not found, reverting to default', path: imagePath });
    } else {
        res.status(404).json({ failure: 'Character does not have an image for this emotion.' });
    }
});

app.post('/advanced-character/:char_id/:emotion', upload.single('emotion'), (req, res) => {
  const { char_id, emotion } = req.params;
  const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, char_id);
  if (!fs.existsSync(char_folder)) {
      fs.mkdirSync(char_folder);
  }
  const emotion_file = req.file;
  if (!emotion_file) {
      res.status(500).json({ error: 'No emotion image file found' });
      return;
  }
  // use the char_id and emotion as the filename
  const emotion_file_name = `${emotion}.png`;
  const emotion_file_path = path.join(char_folder, emotion_file_name);
  // use fs.copyFile to copy the file from the temp folder to the destination folder
  fs.copyFile(emotion_file.path, emotion_file_path, err => {
      if (err) {
          res.status(500).json({ error: 'An error occurred while saving the emotion image file.' });
      } else {
          res.json({ path: emotion_file_path });
      }
  });
});

app.get('/advanced-character/:char_id', (req, res) => {
    const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, req.params.char_id);
    if (fs.existsSync(char_folder)) {
        const emotions_with_ext = fs.readdirSync(char_folder);
        const emotions = emotions_with_ext.map(emotion => path.parse(emotion).name);
        res.json({ success: 'Character emotions found', emotions });
    } else {
        res.status(404).json({ failure: 'Character does not have any emotions.' });
    }
});

app.post('/character-speech/:char_id', (req, res) => {
  const { char_id } = req.params;
  const character_speech = req.body;
  if (!character_speech) {
      res.status(500).json({ error: 'No character speech data found' });
      return;
  }
  const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, char_id);
  if (!fs.existsSync(char_folder)) {
      fs.mkdirSync(char_folder);
  }
  fs.writeFile(path.join(char_folder, 'character_speech.json'), JSON.stringify(character_speech), err => {
      if (err) {
          res.status(500).json({ error: 'An error occurred while saving the character speech data.' });
      } else {
          res.send('Character speech saved successfully!');
      }
  });
});

/*
############################################
##                                        ##
##             Speech ROUTES              ##
##                                        ##
############################################
*/
app.get('/character-speech/:char_id', (req, res) => {
  const { char_id } = req.params;
  const char_folder = path.join(CHARACTER_ADVANCED_FOLDER, char_id);
  if (!fs.existsSync(char_folder)) {
      res.status(404).json({ error: 'Character folder not found' });
      return;
  }
  const speech_file = path.join(char_folder, 'character_speech.json');
  if (!fs.existsSync(speech_file)) {
      res.status(404).json({ error: 'Speech file not found' });
      return;
  }
  fs.readFile(speech_file, (err, data) => {
      if (err) {
          res.status(500).json({ error: 'An error occurred while reading the character speech data.' });
      } else {
          res.json(JSON.parse(data));
      }
  });
});

app.post('/synthesize_speech', async (req, res) => {
  const { ssml, speech_key, service_region } = req.body;
  if (ssml && speech_key && service_region) {
    try {
      const fileName = await synthesizeSpeech(ssml, speech_key, service_region);
      console.log('Speech synthesized successfully.');
      res.status(200).json({ status: 'success', message: 'Speech synthesized successfully.', audio: fileName });
    } catch (error) {
      console.log('Speech synthesis failed.');
      res.status(500).json({ status: 'error', message: 'Speech synthesis failed.' });
    }
  } else {
    console.log('Invalid input.');
    res.status(500).json({ status: 'error', message: 'Invalid input.' });
  }
});


async function synthesizeSpeech(ssmlString, speechKey, serviceRegion) {
  var speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, serviceRegion);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm;
  const files = fs.readdirSync(AUDIO_OUTPUT);
  files.forEach(file => {
    fs.unlinkSync(`${AUDIO_OUTPUT}/${file}`);
    console.log(`File ${file} deleted from ${AUDIO_OUTPUT} directory.`);
  });
  var timestamp = new Date().toISOString().replace(/:/g, '-');
  var fileName = `${AUDIO_OUTPUT}${timestamp}.wav`;
  var audioConfig = sdk.AudioConfig.fromAudioFileOutput(fileName);
  var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  try {
    await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssmlString,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("Speech synthesis succeeded.");
            resolve();
          } else {
            console.error("Speech synthesis failed: " + result.errorDetails);
            reject(new Error(result.errorDetails));
          }
          synthesizer.close();
        },
        error => {
          console.error("Speech synthesis failed: " + error);
          reject(error);
          synthesizer.close();
        }
      );
    });
    return `${timestamp}.wav`;
  } catch (error) {
    console.log('Speech synthesis failed.');
    return null;
  }
}

/*
############################################
##                                        ##
##           Background ROUTES            ##
##                                        ##
############################################
*/
app.post('/backgrounds', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.background) {
    res.status(400).json({ error: 'No background file uploaded.' });
    return;
  }

  const file = req.files.background;
  const ext = '.' + file.name.split('.').pop();
  const filename = uuidv4() + ext;
  const filepath = join(BACKGROUNDS_FOLDER, filename);
  const stream = createWriteStream(filepath);

  file.mv(stream.path, err => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while uploading the file.' });
    } else {
      res.status(200).json({ filename });
    }
  });
});

app.get('/backgrounds', (req, res) => {
  const backgrounds = [];
  const files = fs.readdirSync(BACKGROUNDS_FOLDER);
  files.forEach(file => {
    const ext = path.extname(file);
    if (ext === '.jpg' || ext === '.png') {
      backgrounds.push(file);
    }
  });
  res.json({ backgrounds });
});

app.delete('/backgrounds/:filename', (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    res.status(400).json({ error: 'No filename provided.' });
    return;
  }

  const filepath = join(BACKGROUNDS_FOLDER, filename);
  if (!fs.existsSync(filepath)) {
    res.status(404).json({ error: `File ${filename} not found.` });
    return;
  }

  fs.unlink(filepath, err => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while deleting the file.' });
    } else {
      res.status(200).json({ success: `File ${filename} deleted.` });
    }
  });
});

/*
############################################
##                                        ##
##              USER ROUTES               ##
##                                        ##
############################################
*/
app.post('/user-avatar', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.avatar) {
    res.status(400).send('No avatar file provided');
    return;
  }

  const avatar = req.files.avatar;
  const ext = '.' + avatar.name.split('.').pop();
  const filename = Date.now() + ext;
  const filepath = join(USER_IMAGES_FOLDER, filename);
  const stream = createWriteStream(filepath);

  avatar.mv(stream.path, err => {
    if (err) {
      res.status(500).send('An error occurred while uploading the file.');
    } else {
      res.status(200).json({ avatar: filename });
    }
  });
});

app.get('/user-avatar', (req, res) => {
  const avatars = [];
  const files = fs.readdirSync(USER_IMAGES_FOLDER);
  files.forEach(file => {
    const ext = path.extname(file);
    if (ext === '.png') {
      avatars.push(file);
    }
  });
  res.json({ avatars });
});

app.post('/textgen/:endpointType', async (req, res) => {
  try {
    let { endpointType } = req.params;
    let { endpoint, configuredName, prompt, settings, hordeModel } = req.body;

    let response;
    let results;

    if (endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }
    if (endpoint.endsWith('/api')) {
      endpoint = endpoint.slice(0, -4);
    }
    switch (endpointType) {
      case 'Kobold':
        // Update the payload for the Kobold endpoint
        const koboldPayload = { prompt, ...settings };
        response = await axios.post(`${endpoint}/api/v1/generate`, koboldPayload);
        if (response.status === 200) {
          // Get the results from the response
          results = response.data;
          // If the results are an array, join them into a single string
          if (Array.isArray(results)) {
            results = results.join(' ');
          }
          // Send the results back to the client
          res.json(results);
        }
        break;

      case 'Ooba':
        const params = { prompt };
        const oobaPayload = JSON.stringify([prompt, params]);

        // Send a request to the Ooba endpoint with the payload
        response = await axios.post(`${endpoint}/run/textgen`, {
          data: [oobaPayload]
        });
        // Extract the raw reply from the response
        const rawReply = response.data.data[0];
        const responseHalf = rawReply.split(prompt)[1];
        res.json(responseHalf);
        break;
      case 'OAI':
        // Create a configuration object with your key
        const configuration = new Configuration({
          apiKey: endpoint,
        });
    
        // Create an openaiApi object with your configuration and headers
        const openaiApi = new OpenAIApi(configuration);
        try{
          response = await openaiApi.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt,
            temperature: settings.temperature,
            max_tokens: settings.max_tokens,
            stop: [`${configuredName}:`],
          });
          res.json({ results: [response.data.choices[0].text]})
        } catch (error) {
          console.log(error);
        }
        break;
  
      case 'Horde':
        const hordeKey = endpoint ? endpoint : '0000000000';
        const taskId = uuidv4();
        const payload = { prompt, params: settings, models: [hordeModel] };
        response = await axios.post(
          `${HORDE_API_URL}v2/generate/text/async`,
          payload,
          { headers: { 'Content-Type': 'application/json', 'apikey': hordeKey } }
        );
        while (true) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const statusCheck = await axios.get(`${HORDE_API_URL}v2/generate/text/status/${taskId}`, {
            headers: { 'Content-Type': 'application/json', 'apikey': hordeKey }
          });
          const { done } = statusCheck.data;
          if (done) {
            const getText = await axios.get(`${HORDE_API_URL}v2/generate/text/status/${taskId}`, {
              headers: { 'Content-Type': 'application/json', 'apikey': hordeKey }
            });
            const generatedText = getText.data.generations[0];
            results = { results: [generatedText] };
            res.json(results);
            break;
          }
        }
        break;

      default:
        res.status(404).json({ error: 'Invalid endpoint type or endpoint.' });
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    if (error.isAxiosError) {
      if (error.code === 'ECONNRESET') {
        res.status(500).json({ error: 'Connection reset by the remote server. Please try again later.' });
      } else {
        res.status(500).json({ error: `Request error: ${error.message}` });
      }
    } else {
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
});

app.post('/text/status', async (req, res) => {
  const { endpoint, endpointType } = req.body;
  let endpointUrl = endpoint;
  if (endpoint.endsWith('/')) {
    endpointUrl = endpoint.slice(0, -1);
  }

  try {
    let response;

    switch (endpointType) {
      case 'Kobold':
        response = await axios.get(`${endpointUrl}/api/v1/model`);
        if (response.status === 200) {
          res.json(response.data.result);
        } else {
          res.status(404).json({ error: 'Kobold endpoint is not responding.' });
        }
        break;

      case 'Ooba':
        res.status(500).json({ error: 'Ooba is not yet supported.' });
        break;

      case 'OAI':
        res.status(500).json({ error: 'OAI is not yet supported.' });
        break;

      case 'Horde':
        response = await axios.get(`${HORDE_API_URL}v2/status/heartbeat`);
        if (response.status === 200) {
          res.json({ result: 'Horde heartbeat is steady.' });
        } else {
          res.status(500).json({ error: 'Horde heartbeat failed.' });
        }
        break;

      case 'AkikoBackend':
        res.status(500).json({ error: 'AkikoTextgen is not yet supported.' });
        break;

      default:
        res.status(404).json({ error: 'Invalid endpoint type.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});