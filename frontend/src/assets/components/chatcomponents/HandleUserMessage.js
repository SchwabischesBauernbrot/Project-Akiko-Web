import { getBase64 } from '../miscfunctions';
import { saveConversation } from '../api';

export const handleUserMessage = async (text, image, userAvatar, selectedCharacter, conversationName, messages, setMessages, setInvalidActionPopup, handleChatbotResponse, setActivateImpersonation, configuredName, characterAvatar, activateImpersonation) => {
    if (!selectedCharacter){
    setInvalidActionPopup(true)
    return;
    }
    if(activateImpersonation === true){
    const now = new Date();
    const newIncomingMessage = {
        conversationName: conversationName,
        sender: selectedCharacter.name,
        text: text,
        avatar: characterAvatar,
        isIncoming: true,
        timestamp: now.getTime(),
    };
    const updatedMessages = [...messages, newIncomingMessage];
    setMessages(updatedMessages);
    // Save the conversation with the new message
    saveConversation(selectedCharacter, updatedMessages);
    setActivateImpersonation(false);
    return;
    }
    if (text.length < 1 && image == null) {
    handleChatbotResponse(messages);
    } else {
    const now = new Date();
    const newMessage = {
        conversationName: conversationName,
        sender: configuredName,
        text: text,
        image: image ? await getBase64(image) : null, // convert image to base64 string
        avatar: userAvatar || 'http://clipart-library.com/images/8TAbjBjAc.jpg',
        isIncoming: false,
        timestamp: now.getTime(),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    // Call chatbot response after user message has been added
    handleChatbotResponse(updatedMessages, image);
    // Save the conversation with the new message
    saveConversation(selectedCharacter, updatedMessages);
    }
};
