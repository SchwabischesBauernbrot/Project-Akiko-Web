import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import ChatboxInput from './ChatBoxInput';
import { clearMessages, setName, showHelp, showEmotions, setEmotion } from './slashcommands';
import Avatar from './Avatar';
import { saveConversation, fetchConversation, fetchAdvancedCharacterEmotion, fetchAdvancedCharacterEmotions } from "./api";
import { characterTextGen, classifyEmotion } from "./chatapi";
import { getBase64 } from "./miscfunctions";
import { FiArrowDown, FiArrowUp, FiCheck, FiEdit, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import Connect from "./Connect";
import { UpdateCharacterForm } from "./charactercomponents/UpdateCharacterForm";

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
  const editedMessageRef = useRef(null);
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

  const handleInvalidAction = () => {
    setInvalidActionPopup(false)
    window.location.href = '/characters'
  }
  
  const handleUserMessage = async (text, image, avatar) => {
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
      return;
    }
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
        avatar: avatar || 'http://clipart-library.com/images/8TAbjBjAc.jpg',
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
      <div key={index} className={message.isIncoming ? "incoming-message" : "outgoing-message"} >
        <div className={message.isIncoming ? "avatar incoming-avatar" : "avatar outgoing-avatar"}>
          <img src={message.avatar} onClick={message.sender === selectedCharacter.name ? handleOpenCharacterProfile : undefined}alt={`${message.sender}'s avatar`} />
        </div>
        <div className="message-info">
          <div className="message-buttons">
            <button className="message-button" id={'edit'} onClick={(event) => handleEditMessage(event, index)} title={'Edit Message'}>{editedMessageIndex === index ? <FiCheck/> : <FiEdit/>}</button>
            <button className="message-button" id={'move-up'} onClick={() => handleMoveUp(index)} title={'Move Message Up One'}><FiArrowUp/></button>
            <button className="message-button" id={'move-down'} onClick={() => handleMoveDown(index)} title={'Move Message Down One'}><FiArrowDown/></button>
            <button className="message-button" id={'delete-message'} onClick={() => delMessage(index)} title={'Remove Message from Conversation'}><FiTrash2/></button>
            {index === Math.ceil(messages.length - 1) && message.sender === selectedCharacter.name && (
              <button className="message-button" id={'regenerate'} onClick={() => handleReneration()} title={'Regenerate Message'}><FiRefreshCw/></button>
            )}
          </div>
          <p className="sender-name">{message.sender}</p>
          {editedMessageIndex === index ? (
            <div className="message-editor">
              <textarea
                rows={editRowCounter > 1 ? editRowCounter : Math.ceil(message.text.length / 75)}
                id="message-edit"
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => handleTextEdit(index, e.target.value)}
                onKeyDown={(e) => handleMessageKeyDown(e)}
                ref={editedMessageRef}
                defaultValue={message.text}
                onInput={(e) => { setEditRowCounter(e.target.value.length/75) }}
              />
            </div>
          ) : (
            <div onDoubleClick={(event) => handleEditMessage(event, index)}>
              <ReactMarkdown className="message-text" components={{em: ({node, ...props}) => <i style={{color: 'rgb(211, 211, 211)'}} {...props} />}}>{message.text}</ReactMarkdown>
            </div>
          )}
          {message.image && (
            <img className="sent-image" src={message.image} alt="User image"/>
          )}
        </div>
      </div>
      ))}
      <div ref={messagesEndRef}></div>
      </div>
      <ChatboxInput onSend={handleUserMessage} impersonate={sendImpersonation}/>
      {invalidActionPopup && (
        <div className="modal-overlay">
          <div className="modal-small-box">
            <h2>No Character Selected!</h2>
            <p>If only the void could speak back.</p>
            <button className="select-button" onClick={() => handleInvalidAction()}>Select a Character</button>
          </div>
        </div>
      )}
    </div>
    {showDeleteMessageModal && (
    <div className="modal-overlay">
      <div className="modal-small-box">
        <h2 className="centered">Delete Message</h2>
        <p className="centered">Are you sure you want to delete this message?</p>
        <button className="submit-button" onClick={() => setShowDeleteMessageModal(false)}>Cancel</button>
        <button className="cancel-button" onClick={() => handleDeleteMessage(deleteMessageIndex)}>Delete</button>
      </div>
    </div>
   )}
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