import React, { useState, useEffect, useRef } from "react";
import { fetchCharacter, getCharacterImageUrl, fetchConversation } from "./api";
import { characterTextGen, classifyEmotion } from "./chatcomponents/chatapi";
import ChatboxInput from './ChatBoxInput';
import Avatar from './Avatar';
import Message from "./chatcomponents/Message";
import Connect from "./Connect";
import UpdateCharacterForm from "./charactercomponents/UpdateCharacterForm";
import InvalidActionPopup from './chatcomponents/InvalidActionPopup';
import DeleteMessageModal from './chatcomponents/DeleteMessageModal';
import { createUserMessage, handleSaveConversation } from './chatcomponents/MessageHandling';
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

  useEffect(() => {
    (async () => {
      if (localStorage.getItem("selectedCharacter") !== null) {
        const character = await fetchCharacter(localStorage.getItem("selectedCharacter"));
        setSelectedCharacter(character);
      }
      if (localStorage.getItem("conversationName") !== null) {
        const convo = await fetchConversation(localStorage.getItem("conversationName"));
        setConversation(convo);
      }
      if(localStorage.getItem("configuredName") !== null) {
        setconfiguredName(localStorage.getItem("configuredName"));
      }
    })();
  }, []);
  
  useEffect(() => {
    if (selectedCharacter !== null && conversation === null) {
      const defaultMessage = {
        sender: selectedCharacter.name,
        text: selectedCharacter.first_mes.replace("<USER>", configuredName),
        avatar: getCharacterImageUrl(selectedCharacter.avatar),
        isIncoming: true,
        timestamp: Date.now(),
      };
      setMessages([defaultMessage]);
      setConversation({
        conversationName: `${selectedCharacter.name}_${Date.now()}`,
        messages: [defaultMessage],
        participants: [selectedCharacter.char_id],
      });
    }
    setUserCharacter({ name: configuredName, avatar: getCharacterImageUrl('default.png')});
  }, [selectedCharacter]);

  useEffect(() => {
    // scroll to last message when messages state updates
    if (messagesEndRef.current !== null) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleUserSend = async (text, image) => {
    if (await scanSlash(text, setMessages, setconfiguredName, selectedCharacter, setCurrentEmotion)) {
      return;
    }
    if (!selectedCharacter) {
      setInvalidActionPopup(true);
      return;
    }
    if (text.length < 1 && image == null) {
      handleChatbotResponse(messages);
      return;
    }
  
    let newMessage;
    if (activateImpersonation === true) {
      newMessage = await createUserMessage(text, image, selectedCharacter);
      setActivateImpersonation(false);
    } else {
      newMessage = await createUserMessage(text, image, userCharacter);
    }
  
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages); // Update messages state with the new user message
  
    handleChatbotResponse(updatedMessages, image, selectedCharacter); // Pass updatedMessages instead of messages
  };
  
  

  const handleInvalidAction = () => {
    setInvalidActionPopup(false)
    window.location.href = '/characters'
  } 
  
  const handleChatbotResponse = async (chatHistory, image, currentCharacter) => {
    const isTypingNow = new Date();
    const isTyping = {
      sender: currentCharacter.name,
      text: `*${currentCharacter.name} is typing...*`,
      avatar: getCharacterImageUrl(currentCharacter.avatar),
      isIncoming: true,
      timestamp: isTypingNow.getTime(),
    };
    const isTypingHistory = [...chatHistory, isTyping];
    setMessages(isTypingHistory);
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
    handleSaveConversation(conversationName, participants, updatedMessages);
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
    handleSaveConversation(conversationName, participants, messages);
  };
  
  const delMessage = (index) => {
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
      handleSaveConversation(conversationName, participants, messages);
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
      handleSaveConversation(conversationName, participants, messages);
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
    {openConvoSelector && (
      <ConversationSelectionMenu setConvo={setConversation}/>
    )}
      <div className={'connect-chat-box'}>
        <Connect/>
        <button onClick={() => setOpenConvoSelector(true)}>Manage Chats</button>
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