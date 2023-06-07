import axios from 'axios';
import { AUDIO_LOCATION, CURRENT_URL, API_URL, JS_API, getCharacterSpeech } from '../api';

export async function getBotStatus(){
    const response = await axios.get(`${JS_API}/discord-bot/status`);
    return response.data;
}
export async function startDisBot(){
    const response = axios.get(`${JS_API}/discord-bot/start`);
    return response;
}
export async function stopDisBot(){
    const response = axios.get(`${JS_API}/discord-bot/stop`);
    return response;
}