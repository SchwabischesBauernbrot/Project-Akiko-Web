import axios from 'axios';

const API_URL = 'http://localhost:5100/api';
const AVATARS_FOLDER = 'src/shared_data/character_images';
const EXPORTS_FOLDER = 'src/shared_data/exports';

function parseTextEnd(text) {
    return text.split("\n").map(line => line.trim());
  }
  
  export async function characterTextGen(character, history, endpoint, image, configuredName) {
    let imgText = null;
    if(image !== null){
      imgText = await handleImageSend(image, configuredName)
    }
    const basePrompt = character.name + "'s Persona:\n" + character.description + '\nScenario:' + character.scenario + '\n Example Dialogue:\n' + character.mes_example.replace('{{CHAR}}', character.name) + '\n';
    const convo = 'Current Conversation:\n' + history + (imgText ? imgText : '') +'\n';
    const createdPrompt = basePrompt + convo + character.name + ':';
    const kobold = endpoint + 'api/v1/generate/';
    const response = await axios.post(kobold, { prompt: createdPrompt });
  
    const generatedText = response.data.results[0];
    const parsedText = parseTextEnd(generatedText.text);
    const responseText = parsedText[0] !== undefined ? parsedText[0] : '';
    return responseText;
  }  

  export async function handleImageSend(image, configuredName) {
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
  }
  