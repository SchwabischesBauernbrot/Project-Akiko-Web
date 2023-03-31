import { fetchAdvancedCharacterEmotions, fetchAdvancedCharacterEmotion } from '../api';

export async function scanSlash(text, setMessages, setconfiguredName, selectedCharacter, setCurrentEmotion){
  if (text.startsWith('/')) {
    const [command, argument] = text.split(' ');
    console.log('command:', command);
    switch (command) {
      case '/clear':
        clearMessages(setMessages);
        break;
      case '/clearname':
        setconfiguredName('You');
        localStorage.removeItem('configuredName');
        break;
      case '/name':
        setName(setconfiguredName, argument);
        break;
      case '/help':
        showHelp();
        break;
      case '/emotions':
        await showEmotions(selectedCharacter, fetchAdvancedCharacterEmotions);
        break;
      case '/emotion':
        await setEmotion(argument, setCurrentEmotion, selectedCharacter, fetchAdvancedCharacterEmotion);
        break;
      default:
        alert("Invalid command.");
        break;
    }
    return true;
  }
  return false;
}

export function clearMessages(setMessages) {
  setMessages([]);
  localStorage.removeItem('convoName');
  window.location.href = '/characters';
}
  
export function setName(setconfiguredName, argument) {
  if (argument) {
      setconfiguredName(argument);
      localStorage.setItem('configuredName', argument);
      return;
  }else{
      const name = prompt("Enter your name:");
      setconfiguredName(name);
      localStorage.setItem('configuredName', name);
  }
}

export function showHelp() {
  alert("Available commands:");
}

export async function showEmotions(selectedCharacter) {
  const emotions = await fetchAdvancedCharacterEmotions(selectedCharacter);
  console.log(emotions);
  let emotionsList = "";
  emotions.forEach(element => {
    emotionsList += element + ", ";
  });
  alert("Available emotions: " + emotionsList);
}

export async function setEmotion(emotion, setCurrentEmotion, selectedCharacter) {
  if (emotion === 'default') {
    setCurrentEmotion('default');
  } else {
    const emotionPath = await fetchAdvancedCharacterEmotion(selectedCharacter, emotion);
    if (emotionPath) {
      setCurrentEmotion(emotion);
    } else {
      alert("Invalid emotion.");
    }
  }
}

export default scanSlash