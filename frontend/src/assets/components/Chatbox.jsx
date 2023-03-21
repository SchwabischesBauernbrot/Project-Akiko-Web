import React, { useState, useEffect, useRef } from "react";
import ChatboxInput from './ChatBoxInput';
import { saveConversation, fetchConversation, characterTextGen } from "./api";

function Chatbox({ selectedCharacter, endpoint, convoName, charAvatar}) {
  const [messages, setMessages] = useState([]);
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [conversationName, setConversationName] = useState('')
  const [configuredName, setconfiguredName] = useState('You')
  
  const messagesEndRef = useRef(null); // create ref to last message element in chatbox
  
  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem('configuredName') == null){
        setconfiguredName(localStorage.getItem('configuredName'));
      }
      if (!selectedCharacter) return;
      
      if (selectedCharacter && selectedCharacter.avatar) {
        setCharacterAvatar(charAvatar);
        console.log(selectedCharacter.name, "is selected.");
      }
  
      if (convoName) {
        setConversationName(convoName);
        const conversation = await fetchConversation(convoName);
        setMessages(conversation.messages);
      } else {
        const now = new Date();
        const newName = selectedCharacter.name + "_" + now.getTime();
        setConversationName(newName);
        if (selectedCharacter && selectedCharacter.name) {
          const defaultMessage = {
            conversationName: newName,
            sender: selectedCharacter.name,
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

  useEffect(() => {
    // scroll to last message when messages state updates
    if (messagesEndRef.current !== null) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("scrolling to last message...");
    }
  }, [messages]);

  const handleUserMessage = async ( text, avatar) => {
    if(text.length < 1){
      handleChatbotResponse(messages, null);
    }
    else{
    const now = new Date();
    const newMessage = {
      conversationName: conversationName,
      sender: configuredName,
      text: text,
      avatar: avatar || 'https://cdn.discordapp.com/attachments/1070388301397250170/1072227534713921616/tmpu7e13o19.png',
      isIncoming: false,
      timestamp: now.getTime(),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    // Call chatbot response after user message has been added
    handleChatbotResponse(updatedMessages, newMessage);
    }
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
      sender: selectedCharacter.name,
      text: generatedText.replace('<USER>', configuredName),
      avatar: characterAvatar,
      isIncoming: true,
      timestamp: now.getTime(),
    };
    if(newMessage == null){
      const updatedMessages = [...chatHistory, newIncomingMessage];
      setMessages(updatedMessages);
      saveConversation(selectedCharacter, updatedMessages)
    }else{
      const updatedMessages = [...chatHistory, newIncomingMessage];
      setMessages(updatedMessages);
      saveConversation(selectedCharacter, updatedMessages)
    }
  };
  
  return (
    <div className="chatbox-wrapper">
      <div className="message-box">
        {messages.map((message, index) => (
          <div key={index} className={message.isIncoming ? "incoming-message" : "outgoing-message"} >
            <div className={message.isIncoming ? "avatar incoming-avatar" : "avatar outgoing-avatar"}>
              <img src={message.avatar} alt={`${message.sender}'s avatar`} />
            </div>
            <div className="message-info">
              <p className="sender-name">{message.sender}</p>
              <p className="message-text" dangerouslySetInnerHTML={{__html: message.text.replace(/\*(.*?)\*/g, '<i>$1</i>')}}></p>
            </div>
          </div>
        ))}
      <div ref={messagesEndRef}></div>
      </div>
      <div className="chatbox-input-container">
        <ChatboxInput onSend={handleUserMessage} />
      </div>
    </div>
  );
}

export default Chatbox;