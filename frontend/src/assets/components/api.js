import axios from 'axios';

const API_URL = 'http://localhost:5100/api';
const AVATARS_FOLDER = 'src/shared_data/character_images';

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
  formData.append('char_name', newCharacter.char_name);
  formData.append('char_persona', newCharacter.char_persona);
  formData.append('world_scenario', newCharacter.world_scenario);
  formData.append('char_greeting', newCharacter.char_greeting);
  formData.append('example_dialogue', newCharacter.example_dialogue);
  formData.append('avatar', newCharacter.avatar);

  const response = await axios.post(`${API_URL}/characters`, formData);

  return response.data.avatar;
}

function parseTextEnd(text) {
  return text.split("\n").map(line => line.trim());
}

export async function characterTextGen(character, history, endpoint) {
  const basePrompt = character.char_name + "'s Persona:\n" + character.char_persona + '\nScenario:' + character.world_scenario + '\n Example Dialogue:\n' + character.example_dialogue + '\n';
  const convo = 'Current Conversation:\n' + history;
  const createdPrompt = basePrompt + convo + character.char_name + ':';
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
  formData.append('char_name', updatedCharacter.char_name);
  formData.append('char_persona', updatedCharacter.char_persona);
  formData.append('world_scenario', updatedCharacter.world_scenario);
  formData.append('char_greeting', updatedCharacter.char_greeting);
  formData.append('example_dialogue', updatedCharacter.example_dialogue);
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
      console.log(`The conversation with ${selectedCharacter.char_name} has been saved!`);
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
  if (!character || !character.char_name) {
    return allConversations;
  }
  const characterConversations = allConversations.filter(conversation => conversation.startsWith(character.char_name));
  return characterConversations;
}


export async function fetchConversation(conversationName) {
  const response = await axios.get(`${API_URL}/conversation/${conversationName}`);
  return response.data;
}