import axios from 'axios';

const API_URL = `${window.location.protocol}//${window.location.hostname}:5100/api`;
const CURRENT_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
const AVATARS_FOLDER = 'src/shared_data/character_images';
const USER_AVATARS_FOLDER = 'src/shared_data/user_avatars';
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
  try {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
  } catch {
    console.log('No settings file found.')
  }
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

export function getCharacterImageUrl(avatar) {
  return `${CURRENT_URL}/${AVATARS_FOLDER}/${avatar}`;
}

export function getUserImageUrl(avatar) {
  return `${CURRENT_URL}/${USER_AVATARS_FOLDER}/${avatar}`;
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

export const saveConversation = async (convo) => {
  try {
    const response = await axios.post(`${API_URL}/conversation`, convo);
    if (response.data.status === 'success') {
      console.log('Conversation saved');
    } else {
      console.error('Error saving conversation');
    }
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

export async function fetchConversations() {
  const response = await axios.get(`${API_URL}/conversations`);
  const allConversations = response.data.conversations;
  return allConversations;
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

export async function fetchAdvancedCharacterEmotion(character, emotion) {
  const response = await axios.get(`${API_URL}/advanced-character/${character.char_id}/${emotion}`);
  return response.data['path'];
}

export async function fetchAdvancedCharacterEmotions(character) {
  const response = await axios.get(`${API_URL}/advanced-character/${character.char_id}`);
  return response.data['emotions'];
}

export async function saveAdvancedCharacterEmotion(character, emotionName, emotionFile) {
  const formData = new FormData();
  formData.append('emotion', emotionFile);
  const response = await axios.post(`${API_URL}/advanced-character/${character.char_id}/${emotionName}`, formData);
  return response.data['path'];
}

export async function updateAdvancedCharacter(advancedCharacter) {
  const formData = new FormData();
  formData.append('char_id', advancedCharacter.char_id);
  formData.append('name', advancedCharacter.name);

  const response = await axios.put(`${API_URL}/advanced-character/${advancedCharacter.char_id}`, formData);

  return response.data;
}

export async function getAvailableModules() {
  const response = await axios.get(`${API_URL}/modules`);
  const modules = response.data['modules'];

  // Set localStorage values for caption and classify
  for (let i = 0; i < modules.length; i++) {
    switch (modules[i]) {
      case 'caption':
        localStorage.setItem('imageCaptioning', true);
        break;
      case 'classify':
        localStorage.setItem('useEmotionClassifier', true);
        break;
      default:
        break;
    }
  }

  // Check if both caption and classify are present, otherwise set to false
  const hasCaption = modules.includes('caption');
  const hasClassify = modules.includes('classify');
  if (!hasCaption) {
    localStorage.setItem('imageCaptioning', false);
  }
  if(!hasClassify) {
    localStorage.setItem('useEmotionClassifier', false);
  }

  return modules;
}