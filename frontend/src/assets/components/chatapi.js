import axios from 'axios';

const API_URL = `${window.location.protocol}//${window.location.hostname}:5100/api`;

const kobold_defaults = {
  'max_new_tokens': 200,
  'do_sample': true,
  'temperature': 0.6,
  'top_p': 0.9,
  'typical_p': 1,
  'repetition_penalty': 1.05,
  'top_k': 40,
  'min_length': 10,
  'no_repeat_ngram_size': 0,
  'num_beams': 1,
  'penalty_alpha': 0,
  'length_penalty': 1,
  'early_stopping': false,
}

function parseTextEnd(text) {
    return text.split("\n").map(line => line.trim());
  }
  
  export async function characterTextGen(character, history, endpoint, endpointType, image, configuredName) {
    let customSettings = null;
    try{
      customSettings = localStorage.getItem('customSettings');
      if(customSettings){
        const parsedSettings = JSON.parse(customSettings);
        Object.keys(parsedSettings).forEach(key => {
          kobold_defaults[key] = parsedSettings[key];
        })
      }
    } catch (error) {
      console.log(error);
    }
    let imgText = null;
    if(image !== null){
      imgText = await handleImageSend(image, configuredName)
    }
    const basePrompt = character.name + "'s Persona:\n" + character.description + '\nScenario:' + character.scenario + '\nExample Dialogue:\n' + character.mes_example.replace('{{CHAR}}', character.name) + '\n';
    const convo = 'Current Conversation:\n' + history + (imgText ? imgText : '') +'\n';
    const createdPrompt = basePrompt + convo + character.name + ':';
    const response = await axios.post(API_URL + `/textgen/${endpointType}`, { endpoint: endpoint, prompt: createdPrompt, settings: customSettings === null ? kobold_defaults : customSettings });

    const generatedText = response.data.results[0];
    const parsedText = parseTextEnd(generatedText.text);
    const responseText = parsedText[0] !== undefined ? parsedText[0] : '';
    return responseText;
  };  

  export async function handleImageSend(image, configuredName) {
    if(!image) return Promise.resolve(null);
    var reader = new FileReader();
    reader.readAsDataURL(image);
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1];
        const payload = {
          image: base64data
        };
        try {
          const response = await axios.post(`${API_URL}/caption`, payload);
          const generatedText = response.data.caption;
          const formattedText = `[${configuredName} sends a ${generatedText}]`;
          resolve(formattedText);
        } catch (error) {
          reject(error);
        }
      }
    });
  };

  export async function classifyEmotion(generatedText) {
    const response = await axios.post(`${API_URL}/classify`, { text: generatedText });
    return response.data['classification'];
  };

  export async function getModelStatus() {
    var endpoint = localStorage.getItem('endpoint');
    var endpointType = localStorage.getItem('endpointType');
    const response = await axios.post(API_URL + '/textgen/status', { endpoint: endpoint, endpointType: endpointType});
    return response.data;
  };