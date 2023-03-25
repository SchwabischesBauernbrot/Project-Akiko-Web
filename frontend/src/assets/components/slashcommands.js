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
  
  export async function showEmotions(selectedCharacter, fetchAdvancedCharacterEmotions) {
    const emotions = await fetchAdvancedCharacterEmotions(selectedCharacter);
    console.log(emotions);
    let emotionsList = "";
    emotions.forEach(element => {
      emotionsList += element + ", ";
    });
    alert("Available emotions: " + emotionsList);
  }
  
  export async function setEmotion(emotion, setCurrentEmotion, selectedCharacter, fetchAdvancedCharacterEmotion) {
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
  