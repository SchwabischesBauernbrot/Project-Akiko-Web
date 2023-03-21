import axios from 'axios';

const API_URL = 'http://localhost:5100/api';
const AVATARS_FOLDER = 'src/shared_data/character_images';
const EXPORTS_FOLDER = 'src/shared_data/exports';

export function downloadImage(imageUrl, fileName) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function fetchCharacters() {
  const response = await axios.get(`${API_URL}/characters`);
  return response.data;
}

export async function fetchSettings() {
  const response = await axios.get(`${API_URL}/settings`);
  return response.data;
}

export async function fetchCharacter(charId) {
  const response = await axios.get(`${API_URL}/characters/${charId}`);
  return response.data;
}

export async function createCharacter(newCharacter) {
  const formData = new FormData();
  formData.append('char_id', newCharacter.char_id);
  formData.append('name', newCharacter.name);
  formData.append('personality', newCharacter.personality);
  formData.append('description', newCharacter.description);
  formData.append('scenario', newCharacter.scenario);
  formData.append('first_mes', newCharacter.first_mes);
  formData.append('mes_example', newCharacter.mes_example);
  formData.append('avatar', newCharacter.avatar);

  const response = await axios.post(`${API_URL}/characters`, formData);

  return response.data.avatar;
}

function parseTextEnd(text) {
  return text.split("\n").map(line => line.trim());
}

export async function characterTextGen(character, history, endpoint) {
  const basePrompt = character.name + "'s Persona:\n" + character.description + '\nScenario:' + character.scenario + '\n Example Dialogue:\n' + character.mes_example.replace('{{CHAR}}', character.name) + '\n';
  const convo = 'Current Conversation:\n' + history;
  const createdPrompt = basePrompt + convo + character.name + ':';
  const kobold = endpoint + 'api/v1/generate/';
  const response = await axios.post(kobold, { prompt: createdPrompt });

  const generatedText = response.data.results[0];
  const parsedText = parseTextEnd(generatedText.text);
  const responseText = parsedText[0] !== undefined ? parsedText[0] : '';
  return responseText;
}

export function getCharacterImageUrl(avatar) {
  return `/${AVATARS_FOLDER}/${avatar}`;
}

export async function deleteCharacter(charId) {
  const response = await axios.delete(`${API_URL}/characters/${charId}`);
  return response.data;
}

export async function updateCharacter(updatedCharacter) {
  const formData = new FormData();
  formData.append('char_id', updatedCharacter.char_id);
  formData.append('name', updatedCharacter.name);
  formData.append('personality', updatedCharacter.personality);
  formData.append('description', updatedCharacter.description);
  formData.append('scenario', updatedCharacter.scenario);
  formData.append('first_mes', updatedCharacter.first_mes);
  formData.append('mes_example', updatedCharacter.mes_example);
  formData.append('avatar', updatedCharacter.avatar);

  const response = await axios.put(`${API_URL}/characters/${updatedCharacter.char_id}`, formData);

  return response.data;
}

export const saveConversation = async (selectedCharacter, updatedMessages) => {
  const newConversation = { messages: updatedMessages };
  localStorage.setItem(`conversation_${selectedCharacter.char_id}`, JSON.stringify(newConversation));

  try {
    const response = await axios.post(`${API_URL}/conversation`, newConversation);
    if (response.data.status === 'success') {
      console.log(`The conversation with ${selectedCharacter.name} has been saved!`);
    } else {
      console.error('Error saving conversation');
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

export async function fetchConversations(character) {
  const response = await axios.get(`${API_URL}/conversations`);
  const allConversations = response.data.conversations;
  if (!character || !character.name) {
    return allConversations;
  }
  const characterConversations = allConversations.filter(conversation => conversation.startsWith(character.name));
  return characterConversations;
}

export async function deleteConversation(conversationName) {
  const response = await axios.delete(`${API_URL}/conversation/${conversationName}`);
  return response.data;
}

export async function fetchConversation(conversationName) {
  const response = await axios.get(`${API_URL}/conversation/${conversationName}`);
  return response.data;
}

export async function uploadTavernCharacter(image){
  const formData = new FormData();
  formData.append('char_id', Date.now());
  formData.append('image', image);
  const response = await axios.post(`${API_URL}/tavern-character`, formData);
  return response.data;
}

export async function exportTavernCharacter(charId) {
  await axios.get(`${API_URL}/tavern-character/${charId}`);
  var link = `/${EXPORTS_FOLDER}/${charId}.png`
  downloadImage(link, `${charId}.png`);
  return `/${EXPORTS_FOLDER}/${charId}.png`;
}