import React, { useState, useEffect, useRef } from "react";
import { fetchCharacter, getCharacterImageUrl, fetchConversation, saveConversation, deleteConversation } from "./api";
import { characterTextGen, classifyEmotion } from "./chatcomponents/chatapi";
import ChatboxInput from './ChatBoxInput';
import Avatar from './Avatar';
import Message from "./chatcomponents/Message";
import Connect from "./Connect";
import UpdateCharacterForm from "./charactercomponents/UpdateCharacterForm";
import InvalidActionPopup from './chatcomponents/InvalidActionPopup';
import DeleteMessageModal from './chatcomponents/DeleteMessageModal';
import { createUserMessage } from './chatcomponents/MessageHandling';
import scanSlash from './chatcomponents/slashcommands';
import ConversationSelectionMenu from "./chatcomponents/ConversationSelectionMenu";

function Chatbox({ endpoint, endpointType }) {
  const [messages, setMessages] = useState([]);
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
  const [openConvoSelector, setOpenConvoSelector] = useState(false);
  const [userCharacter, setUserCharacter] = useState(null);
  const messagesEndRef = useRef(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [settings, setSettings] = useState(null);

  const createNewConversation = async () => {
    const defaultMessage = {
      sender: selectedCharacter.name,
      text: selectedCharacter.first_mes.replace("<USER>", configuredName),
      avatar: getCharacterImageUrl(selectedCharacter.avatar),
      isIncoming: true,
      timestamp: Date.now(),
    };
    const newConvoName = `${selectedCharacter.name}_${Date.now()}`;
    const newConversation = {
      conversationName: newConvoName,
      messages: [defaultMessage],
      participants: [selectedCharacter.char_id],
    };
    setConversation(newConversation);
    setMessages(newConversation.messages);
    localStorage.setItem("conversationName", newConvoName);
    await saveConversation(newConversation);
  };

  const deleteCurrentConversation = async () => {
    await deleteConversation(conversation.conversationName);
    localStorage.setItem("conversationName", null);
    setConversation(null);
    setMessages([]);
    await createNewConversation();
  };

  useEffect(() => {
    const fetchConfig = async () => {
      if(localStorage.getItem('selectedCharacter') !== null) {
        const character = await fetchCharacter(localStorage.getItem('selectedCharacter'));
        setSelectedCharacter(character);
      }
      if(!localStorage.getItem('conversationName') || localStorage.getItem('conversationName') === 'null') {
        if(!selectedCharacter) return;
        createNewConversation();
      }else{
        const previousConversation = await fetchConversation(localStorage.getItem('conversationName'));
        if(!previousConversation) {
          createNewConversation();
          return;
        }
        setConversation(previousConversation);
        setMessages(previousConversation.messages);
      }
    };
    fetchConfig();
    setUserCharacter({ name: configuredName, avatar: getCharacterImageUrl('default.png')});
  }, []);

  useEffect(() => {
    // scroll to last message when messages state updates
    if (messagesEndRef.current !== null) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleUserSend = async (text, image) => {
    let currentCharacter;
    if(conversation.participants.length > 1) {
      const randomIndex = Math.floor(Math.random() * conversation.participants.length);
      currentCharacter = await fetchCharacter(conversation.participants[randomIndex]);
    }else {
      currentCharacter = await fetchCharacter(conversation.participants[0]); 
    }
    if (await scanSlash(text, setMessages, setconfiguredName, currentCharacter, setCurrentEmotion)) {
      return;
    }
    if (!currentCharacter) {
      setInvalidActionPopup(true);
      return;
    }
    if (text.length < 1 && image == null) {
      handleChatbotResponse(messages, image, currentCharacter);
      return;
    }
  
    let newMessage;
    if (activateImpersonation === true) {
      newMessage = await createUserMessage(text, image, currentCharacter);
      setActivateImpersonation(false);
    } else {
      newMessage = await createUserMessage(text, image, userCharacter);
    }
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages); // Update messages state with the new user message
    saveConversation({conversationName: conversation.conversationName, participants: conversation.participants, messages: updatedMessages,});
    handleChatbotResponse(updatedMessages, image, currentCharacter); // Pass updatedMessages instead of messages
  };

  const handleInvalidAction = () => {
    setInvalidActionPopup(false)
    window.location.href = '/characters'
  } 
  
  const handleChatbotResponse = async (chatHistory, image, currentCharacter) => {
    const isTypingNow = new Date();
    const isTyping = {
      sender: currentCharacter.name,
      text: `*${currentCharacter.name} is typing*`,
      avatar: getCharacterImageUrl(currentCharacter.avatar),
      isIncoming: true,
      timestamp: isTypingNow.getTime(),
    };
    const isTypingHistory = [...chatHistory, isTyping];
    setTimeout(() => {
      setMessages(isTypingHistory);
    }, 2000);
    const history = chatHistory
    .map((message) => `${message.sender}: ${message.text}`)
    .join('\n');

    // Make API call
    const generatedText = await characterTextGen(currentCharacter, history, endpoint, endpointType, image, configuredName);
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
      sender: currentCharacter.name,
      text: generatedText.replace('<USER>', configuredName),
      avatar: getCharacterImageUrl(currentCharacter.avatar),
      isIncoming: true,
      timestamp: now.getTime(),
    };
    const updatedMessages = [...chatHistory, newIncomingMessage];
    setMessages(updatedMessages);
    saveConversation({conversationName: conversation.conversationName, participants: conversation.participants, messages: updatedMessages,});
    //settings.GroupChatSettings.RandomReply === true &&
    if(conversation.participants.length > 1){
      const randomChance = Math.floor(Math.random() * 100);
      if(randomChance < 60){
        const randomIndex = Math.floor(Math.random() * conversation.participants.length);
        currentCharacter = await fetchCharacter(conversation.participants[randomIndex]);
        handleChatbotResponse(updatedMessages, image, currentCharacter);
      }
    }
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
    setDeleteMessageIndex(-1);
    setShowDeleteMessageModal(false);
    saveConversation({conversationName: conversation.conversationName, participants: conversation.participants, messages: updatedMessages,});
  };
  
  const delMessage = (index) => {
    setDeleteMessageIndex(index);
    setShowDeleteMessageModal(true);
  };

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
      saveConversation({conversationName: conversation.conversationName, participants: conversation.participants, messages: updatedMessages,});
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
      saveConversation({conversationName: conversation.conversationName, participants: conversation.participants, messages: updatedMessages,});
    }
  };

  const sendImpersonation = () => {
    setActivateImpersonation(!activateImpersonation);
  };

  const handleReneration = async () => {
    let currentIndex = messages.length - 1;
    const updatedMessages = messages.filter((_, i) => i !== currentIndex);
    setMessages(updatedMessages);
    handleChatbotResponse(updatedMessages, null, selectedCharacter);
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

  const handleSetConversation = (conversation) => {
    setConversation(conversation);
    setMessages(conversation.messages);
    setOpenConvoSelector(false);
  }

  const handleConversationDelete = async (convo) => {
    if(convo){
      await deleteConversation(convo);
      if(convo === conversation.conversationName){
        deleteCurrentConversation();
      }
      setOpenConvoSelector(false);
      return;
    }
    deleteCurrentConversation();
  }

  return (
    <>
    {selectedCharacter && (
      <Avatar selectedCharacter={selectedCharacter} emotion={currentEmotion}/>
    )}
    {openConvoSelector && (
      <ConversationSelectionMenu setConvo={handleSetConversation} handleDelete={handleConversationDelete} handleChatMenuClose={() => setOpenConvoSelector(false)}/>
    )}
      <div className={'connect-chat-box'}>
        <Connect/>
        <button className={'button'} id={'submit'} onClick={() => setOpenConvoSelector(true)}>Manage Chats</button>
        <button className={'button'} id={'cancel'} onClick={() => handleConversationDelete()}>Delete Chat</button>
        <button className={'button'} id={'submit'} onClick={() => createNewConversation()}>New Chat</button>
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
          selectedCharacter={userCharacter}
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