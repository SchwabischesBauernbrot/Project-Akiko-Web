import React, { useState, useEffect, useRef } from "react";
import ChatboxInput from './ChatBoxInput';
import Avatar from './Avatar';
import { saveConversation, fetchConversation } from "./api";
import { characterTextGen, classifyEmotion } from "./chatcomponents/chatapi";
import Message from "./chatcomponents/Message";
import { updateCharacter } from "./api";
import { saveConversation, fetchConversation, fetchAdvancedCharacterEmotion, fetchAdvancedCharacterEmotions } from "./api";
import { characterTextGen, classifyEmotion } from "./chatapi";
import { getBase64 } from "./miscfunctions";
import { FiArrowDown, FiArrowUp, FiCheck, FiEdit, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import Connect from "./Connect";
import { UpdateCharacterForm } from "./charactercomponents/UpdateCharacterForm";
import InvalidActionPopup from './chatcomponents/InvalidActionPopup';
import DeleteMessageModal from './chatcomponents/DeleteMessageModal';
import { handleUserMessage } from './chatcomponents/HandleUserMessage';
import { scanSlash } from './chatcomponents/slashcommands';

function Chatbox({ selectedCharacter, endpoint, endpointType, convoName, charAvatar}) {
  const [messages, setMessages] = useState([]);
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [conversationName, setConversationName] = useState('');
  const [configuredName, setconfiguredName] = useState('You');
  const [useEmotionClassifier, setUseEmotionClassifier] = useState(false);
  const [invalidActionPopup, setInvalidActionPopup] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('default');
  const [editRowCounter, setEditRowCounter] = useState(1);
  const [editedMessageIndex, setEditedMessageIndex] = useState(-1);
  const [showDeleteMessageModal, setShowDeleteMessageModal] = useState(false);
  const [deleteMessageIndex, setDeleteMessageIndex ] = useState(-1);
  const [activateImpersonation, setActivateImpersonation] = useState(false);
  const [openCharacterProfile, setOpenCharacterProfile] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if(localStorage.getItem('useEmotionClassifier') !== null){
        setUseEmotionClassifier(localStorage.getItem('useEmotionClassifier'));
      }
      if (!localStorage.getItem('configuredName') == null){
        setconfiguredName(localStorage.getItem('configuredName'));
      }
      if (selectedCharacter && selectedCharacter.avatar) {
        setCharacterAvatar(charAvatar);
        console.log(selectedCharacter.name, "is selected.");
      }else{
        return;
      }
      if (convoName !== null) {
        setConversationName(convoName);
        localStorage.setItem('convoName', convoName);
        const conversation = await fetchConversation(convoName);
        setMessages(conversation.messages);
      }else {
        const now = new Date();
        const newName = selectedCharacter.name + "_" + now.getTime();
        localStorage.setItem('convoName', newName);
        setConversationName(newName);
        if (selectedCharacter && selectedCharacter.name) {
          const defaultMessage = {
            conversationName: newName,
            sender: selectedCharacter.name,
            text: selectedCharacter.first_mes.replace('<USER>', configuredName),
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
    }
  }, [messages]);

  const handleUserSend = async (text, image) => {
    if(await scanSlash(text, setMessages, setconfiguredName, selectedCharacter, setCurrentEmotion)){
      return;
    }
    await handleUserMessage(text, image, userAvatar, selectedCharacter, conversationName, messages, setMessages, setInvalidActionPopup, handleChatbotResponse, setActivateImpersonation, configuredName, characterAvatar, activateImpersonation);
  }
  const handleInvalidAction = () => {
    setInvalidActionPopup(false)
    window.location.href = '/characters'
  } 
  
  const handleChatbotResponse = async (chatHistory, image) => {
    const isTypingNow = new Date();
    const isTyping = {
      conversationName: conversationName,
      sender: selectedCharacter.name,
      text: `*${selectedCharacter.name} is typing...*`,
      avatar: characterAvatar,
      isIncoming: true,
      timestamp: isTypingNow.getTime(),
    };
    const isTypingHistory = [...chatHistory, isTyping];
    setMessages(isTypingHistory);
    const history = chatHistory
    .map((message) => `${message.sender}: ${message.text}`)
    .join('\n');

    // Make API call
    const generatedText = await characterTextGen(selectedCharacter, history, endpoint, endpointType, image, configuredName);
    if (generatedText !== null) {
      if(useEmotionClassifier === 'true'){
      const classification = await classifyEmotion(generatedText);
      if (classification && classification.length > 0) {
        const label = classification[0]['label'];
        setCurrentEmotion(label);
      } else {
        console.error('Invalid classification data:', classification);
      }
      }
    }
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
    const updatedMessages = [...chatHistory, newIncomingMessage];
    setMessages(updatedMessages);
    saveConversation(selectedCharacter, updatedMessages);
  };

  const handleTextEdit = (index, newText) => {
    const updatedMessages = messages.map((msg, i) => {
      if (i === index) {
        return { ...msg, text: newText };
      }
      return msg;
    });
    setEditedMessageIndex(-1);
    setMessages(updatedMessages);
  };  

  const handleEditMessage = (event, index) => {
    event.preventDefault();
    event.target.blur();
    setEditedMessageIndex(index);
  };
  
  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
    }
  };

  const handleDeleteMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
    saveConversation(selectedCharacter, updatedMessages);
    setDeleteMessageIndex(-1);
    setShowDeleteMessageModal(false);
  };
  
  const delMessage = async (index) => {
    setDeleteMessageIndex(index);
    setShowDeleteMessageModal(true);
  };

  // Add these new functions inside the Chatbox component
  const handleMoveUp = (index) => {
    if (index > 0) {
      const updatedMessages = messages.map((msg, i) => {
        if (i === index - 1) {
          return messages[index];
        } else if (i === index) {
          return messages[index - 1];
        }
        return msg;
      });
      setMessages(updatedMessages);
      saveConversation(selectedCharacter, updatedMessages);
    }
  };

  const handleMoveDown = (index) => {
    if (index < messages.length - 1) {
      const updatedMessages = messages.map((msg, i) => {
        if (i === index) {
          return messages[index + 1];
        } else if (i === index + 1) {
          return messages[index];
        }
        return msg;
      });
      setMessages(updatedMessages);
      saveConversation(selectedCharacter, updatedMessages);
    }
  };

  const sendImpersonation = () => {
    setActivateImpersonation(!activateImpersonation);
  };

  const handleReneration = () => {
    let currentIndex = messages.length - 1;
    const updatedMessages = messages.filter((_, i) => i !== currentIndex);
    setMessages(updatedMessages);
    handleChatbotResponse(updatedMessages);
  }

  const handleOpenCharacterProfile = () => {
    setOpenCharacterProfile(true);
  }
  const handleUpdateCharacterProfile = () => {
    window.location.reload();
    handleCloseCharacterProfile();
  }

  const handleCloseCharacterProfile = () => {
    setOpenCharacterProfile(false);
  }

  return (
    <>
    {selectedCharacter && (
      <Avatar selectedCharacter={selectedCharacter} emotion={currentEmotion}/>
    )}
      <div className={'connect-chat-box'}>
        <Connect/>
      </div>
    <div className="chatbox-wrapper">
      <div className="message-box">
      {messages.map((message, index) => (
        <Message
          key={index}
          message={message}
          index={index}
          editedMessageIndex={editedMessageIndex}
          handleEditMessage={handleEditMessage}
          handleTextEdit={handleTextEdit}
          handleMessageKeyDown={handleMessageKeyDown}
          editRowCounter={editRowCounter}
          handleMoveUp={handleMoveUp}
          handleMoveDown={handleMoveDown}
          delMessage={delMessage}
          handleReneration={handleReneration}
          handleOpenCharacterProfile={handleOpenCharacterProfile}
          selectedCharacter={selectedCharacter}
          messages={messages}
        />
      ))}
      <div ref={messagesEndRef}></div>
      </div>
      <ChatboxInput onSend={handleUserSend} impersonate={sendImpersonation}/>
    </div>
    <InvalidActionPopup isOpen={invalidActionPopup} handleInvalidAction={handleInvalidAction} />
    <DeleteMessageModal isOpen={showDeleteMessageModal} handleCancel={() => setShowDeleteMessageModal(false)} handleDelete={() => handleDeleteMessage(deleteMessageIndex)} />
  {openCharacterProfile && (
    <UpdateCharacterForm
    character={selectedCharacter}
    onUpdateCharacter={handleUpdateCharacterProfile}
    onClose={handleCloseCharacterProfile}
    />
   )}
    </>
  );
}

export default Chatbox;