import React, { useState, useEffect } from "react";
import ChatboxInput from './ChatBoxInput';
import { saveConversation, fetchConversation, characterTextGen } from "./api";

function Chatbox({ selectedCharacter, endpoint, convoName, charAvatar}) {
  const [messages, setMessages] = useState([]);
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [conversationName, setConversationName] = useState('')
  const configuredName = 'Sen'
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedCharacter) return;
      
      if (selectedCharacter && selectedCharacter.avatar) {
        setCharacterAvatar(charAvatar);
        console.log(selectedCharacter.char_name, "is selected.");
      }
  
      if (convoName) {
        setConversationName(convoName);
        const conversation = await fetchConversation(convoName);
        setMessages(conversation.messages);
      } else {
        const now = new Date();
        const newName = selectedCharacter.char_name + "_" + now.getTime();
        setConversationName(newName);
        if (selectedCharacter && selectedCharacter.char_name) {
          const defaultMessage = {
            conversationName: newName,
            sender: selectedCharacter.char_name,
            text: selectedCharacter.char_greeting.replace('<USER>', configuredName),
            avatar: characterAvatar,
            isIncoming: true,
            timestamp: Date.now(),
          };
          setMessages([defaultMessage]);
        }
      }
    };
  
    fetchData();
  }, [selectedCharacter, convoName, charAvatar]);


  const handleUserMessage = async (sender, text, avatar) => {
    const now = new Date();
    const newMessage = {
      conversationName: conversationName,
      sender: sender,
      text: text,
      avatar: avatar || 'https://cdn.discordapp.com/attachments/1070388301397250170/1072227534713921616/tmpu7e13o19.png',
      isIncoming: false,
      timestamp: now.getTime(),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    // Call chatbot response after user message has been added
    handleChatbotResponse(updatedMessages, newMessage);
  };
  
  const handleChatbotResponse = async (chatHistory, newMessage) => {
    const history = chatHistory
    .map((message) => `${message.sender}: ${message.text}`)
    .join('\n');

    // Make API call
    const generatedText = await characterTextGen(selectedCharacter, history, endpoint);
  
    // Add new incoming message to state
    const now = new Date();
    const newIncomingMessage = {
      conversationName: conversationName,
      sender: selectedCharacter.char_name,
      text: generatedText.replace('<USER>', newMessage.sender),
      avatar: characterAvatar,
      isIncoming: true,
      timestamp: now.getTime(),
    };
    const updatedMessages = [...messages, newMessage, newIncomingMessage];
    setMessages(updatedMessages);
    saveConversation(selectedCharacter, updatedMessages)
  };
  

  return (
    <div className="chatbox-wrapper">
      <div className="message-box">
        {messages.map((message, index) => (
          <div key={index} className={message.isIncoming ? "incoming-message" : "outgoing-message"}>
            <div className={message.isIncoming ? "avatar incoming-avatar" : "avatar outgoing-avatar"}>
              <img src={message.avatar} alt={`${message.sender}'s avatar`} />
            </div>
            <div className="message-info">
              <p className="sender-name">{message.sender}</p>
              <p className="message-text">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="chatbox-input-container">
        <ChatboxInput onSend={handleUserMessage} />
      </div>
    </div>
  );
}

export default Chatbox;