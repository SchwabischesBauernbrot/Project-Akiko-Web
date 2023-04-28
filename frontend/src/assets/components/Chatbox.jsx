import React, { useState, useEffect, useRef } from "react";
import { fetchCharacter, getCharacterImageUrl, fetchConversation, saveConversation, deleteConversation, getAvailableModules } from "./api";
import { characterTextGen, classifyEmotion, generate_Speech } from "./chatcomponents/chatapi";
import ChatboxInput from './ChatBoxInput';
import Avatar from './Avatar';
import Message from "./chatcomponents/Message";
import Connect from "./Connect";
import ConversationCreate from "./chatcomponents/ConversationCreate";
import UpdateCharacterForm from "./charactercomponents/UpdateCharacterForm";
import InvalidActionPopup from './chatcomponents/InvalidActionPopup';
import DeleteMessageModal from './chatcomponents/DeleteMessageModal';
import { createUserMessage } from './chatcomponents/MessageHandling';
import scanSlash, { setEmotion } from './chatcomponents/slashcommands';
import ConversationSelectionMenu from "./chatcomponents/ConversationSelectionMenu";
import {FiList, FiPlusCircle, FiTrash2, FiUsers} from 'react-icons/fi';
import {VscDebugDisconnect} from 'react-icons/vsc';
import Model from "./Model";
import ConnectMenu from "./chatcomponents/ConnectMenu";
import UserInfo from "./chatcomponents/UserInfo";
function Chatbox({ endpoint, endpointType }) {
  const [messages, setMessages] = useState([]);
  const [configuredName, setconfiguredName] = useState('You');
  const [configuredAvatar, setconfiguredAvatar] = useState('default.png');
  const [useEmotionClassifier, setUseEmotionClassifier] = useState('');
  const [invalidActionPopup, setInvalidActionPopup] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState([]);
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [createMenuOn, setCreateMenuOn] = useState(false);
  const [toggleConnectMenu, setToggleConnectMenu] = useState(false);
  const [openUserProfile, setOpenUserProfile] = useState(false);
  const [toggleBranch, setToggleBranch] = useState(true);
  
  const createNewConversation = async () => {
    const defaultMessage = {
      sender: selectedCharacter.name,
      text: selectedCharacter.first_mes.replace('<USER>', configuredName).replace('{{char}}', selectedCharacter.name).replace('{{user}}', configuredName).replace('{{CHAR}}', selectedCharacter.name).replace('{{USER}}', configuredName),
      avatar: getCharacterImageUrl(selectedCharacter.avatar),
      isIncoming: true,
      timestamp: Date.now(),
    };
    const newConvoName = `${selectedCharacter.name}_${Date.now()}`;
    const newConversation = {
      conversationName: newConvoName,
      messages: [defaultMessage],
      participants: [{ characterName: selectedCharacter.name, char_id: selectedCharacter.char_id }],
    };
    setConversation(newConversation);
    setMessages(newConversation.messages);
    localStorage.setItem("conversationName", newConvoName);
    await saveConversation(newConversation);
  };

  const deleteCurrentConversation = async () => {
    try{
      await deleteConversation(conversation.conversationName);
      localStorage.setItem("conversationName", null);
    }catch(e) {
      console.log(e);
    }
    await createNewConversation();
  };

  useEffect(() => {
    const getRandomParticipants = (participants, count) => {
      const selectedIndices = new Set();
  
      while (selectedIndices.size < count) {
        const randomIndex = Math.floor(Math.random() * participants.length);
        selectedIndices.add(randomIndex);
      }
  
      return Array.from(selectedIndices).map((index) => participants[index]);
    };
    
    if (conversation && conversation.participants.length > 1) {
      const participants = getRandomParticipants(conversation.participants, 2); // Randomly select two participants
      setSelectedParticipants(participants);
    } else if (conversation) {
      setSelectedParticipants([conversation.participants[0]]); // Select the only participant
    }
  }, [conversation]);
  

  useEffect(() => {
      const fetchConfig = async () => {
        if (localStorage.getItem('selectedCharacter') !== null) {
          const character = await fetchCharacter(localStorage.getItem('selectedCharacter'));
          setSelectedCharacter(character);
        }
        if(localStorage.getItem('configuredName') !== null) {
          setconfiguredName(localStorage.getItem('configuredName'));
        }
        if(localStorage.getItem('configuredAvatar') !== null) {
          setconfiguredAvatar(localStorage.getItem('configuredAvatar'));
        }
        if(localStorage.getItem('useEmotionClassifier') !== null) {
          if(localStorage.getItem('useEmotionClassifier') === '1') {
            setUseEmotionClassifier('true');
          } else {
            setUseEmotionClassifier('false');
          }
        }
        if(localStorage.getItem('toggleBranch') !== null) {
          if(localStorage.getItem('toggleBranch') === 'true') {
            setToggleBranch(true);
          } else {
            setToggleBranch(false);
          }
        }
      };
      fetchConfig();
      setUserCharacter({ name: configuredName, avatar: configuredAvatar });
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedCharacter !== null && !isInitialized) {
        setIsInitialized(true);
        let previousConversation = null;
        const existingConversationName = localStorage.getItem("conversationName");
  
        if (existingConversationName) {
          try {
            previousConversation = await fetchConversation(existingConversationName);
          } catch (e) {
            console.log(e);
            localStorage.setItem("conversationName", null);
          }
        }
  
        // Check if the previous conversation exists and includes the selected character
        if (
          previousConversation &&
          previousConversation.participants.some(
            (participant) => participant.char_id === selectedCharacter.char_id
          )
        ) {
          setConversation(previousConversation);
          setMessages(previousConversation.messages);
  
          // Initialize default emotions for the first two characters if there are more than one
          if (previousConversation.participants.length > 1) {
            setCurrentEmotion(
              previousConversation.participants.slice(0, 2).map((participant) => ({
                char_id: participant.char_id,
                emotion: 'default',
              }))
            );
          } else {
            setCurrentEmotion([{ char_id: selectedCharacter.char_id, emotion: 'default' }]);
          }
        } else {
          // If no suitable conversation was found, create a new one
          await createNewConversation();
          setCurrentEmotion([{ char_id: selectedCharacter.char_id, emotion: 'default' }]);
        }
      }
    })();
  }, [selectedCharacter, isInitialized]);
  

  useEffect(() => {
    setUserCharacter({ name: configuredName, avatar: configuredAvatar});
  }, [configuredName, configuredAvatar]);

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
      currentCharacter = await fetchCharacter(conversation.participants[randomIndex]['char_id']);
    }else {
      currentCharacter = await fetchCharacter(conversation.participants[0]['char_id']); 
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
      newMessage = await createUserMessage(text, image, currentCharacter, activateImpersonation);
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
    let emotion = 'neutral';
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
    }, 1000);
    let history;
    if(endpointType !== 'OAI'){
      history = chatHistory
      .slice(-15) // Add this line to only take the last 15 messages
      .map((message) => `${message.sender}: ${message.text}`)
      .join('\n');
    }else{
      history = chatHistory
      .slice(-25) // Add this line to only take the last 25 messages
      .map((message) => `${message.sender}: ${message.text}`)
      .join('\n');
    }

    // Make API call
    const generatedText = await characterTextGen(currentCharacter, history, endpoint, endpointType, image, configuredName);
    if(useEmotionClassifier === 'true'){
      const classification = await classifyEmotion(generatedText);
      if (classification && classification.length > 0) {
        const label = classification[0]['label'];
        console.log(label)
        // Find the index of the currentCharacter's char_id in the currentEmotion array
        const characterIndex = currentEmotion.findIndex(emotion => emotion.char_id === currentCharacter.char_id);
  
        let newEmotions;
        emotion = label;
        if (characterIndex !== -1) {
          // If the character's char_id is found, update the emotion in the existing object
          newEmotions = currentEmotion.map((emotion, index) =>
            index === characterIndex ? { ...emotion, emotion: label } : emotion
        );
        } else {
          // If the character's char_id is not found, add a new object to the array
          newEmotions = [...currentEmotion, { char_id: currentCharacter.char_id, emotion: label }];
        }
        setCurrentEmotion(newEmotions);
      } else {
        console.error('Invalid classification data:', classification);
      }
    }
    if(localStorage.getItem('speech_key') != null && localStorage.getItem('speech_key') != 'none'){
      await generate_Speech(generatedText, emotion, currentCharacter);
    }
    // Add new incoming message to state
    const now = new Date();
    const newIncomingMessage = {
      sender: currentCharacter.name,
      text: generatedText.replace('<USER>', configuredName).replace('{{char}}', currentCharacter.name).replace('{{user}}', configuredName).replace('{{CHAR}}', currentCharacter.name).replace('{{USER}}', configuredName),
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
    saveConversation({conversationName: conversation.conversationName, participants: conversation.participants, messages: updatedMessages,});
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
    if(!toggleBranch) {

      return 
    }
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
    if(!toggleBranch) {
      return
    }
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
  useEffect(() => {
    if (toggleBranch) {
      handleMoveUp();
      handleMoveDown();
    }
  }, [toggleBranch]);

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
    if (conversation.participants.length > 1) {
      setCurrentEmotion(
        conversation.participants.slice(0, 2).map((participant) => ({
          char_id: participant.char_id,
          emotion: 'default',
        }))
      );
    } else {
      setCurrentEmotion([{ char_id: selectedCharacter.char_id, emotion: 'default' }]);
    }
    setConversation(conversation);
    setMessages(conversation.messages);
    setOpenConvoSelector(false);
  }

  const handleConversationDelete = async (convo) => {
    if(convo !== null){
      await deleteConversation(convo);
      if(convo === conversation.conversationName){
        deleteCurrentConversation();
      }
      setOpenConvoSelector(false);
      return;
    }
  }

  const handleTitleEdit = async (newText) => {
    if(newText === conversation.conversationName){
      return;
    }
    if(newText === ''){
      newText = 'Untitled Conversation';
    }
    try{
      const convo = await fetchConversation(newText);
      if(convo){
        alert('Conversation with this name already exists. Please choose a different name.');
        return;
      }
    } catch (e) {
      console.error(e);
    }
    try{
      await deleteConversation(conversation.conversationName);
    } catch (e) {
      console.error(e);
    }
    const renamedConvo = {conversationName: newText, participants: conversation.participants, messages: conversation.messages,}
    await saveConversation(renamedConvo);
    localStorage.setItem("conversationName", newText);
    setConversation(renamedConvo);
  };

  const CreateConvo = async (convo) => {
    await saveConversation(convo);
    localStorage.setItem('conversationName', convo.conversationName);
    setConvo(convo);
  }

  const changeUserInfo = async (user) => {
    setconfiguredName(user.name);
    setconfiguredAvatar(user.avatar);
  }

  const handleOpenUserProfile = () => {
    setOpenUserProfile(true);
  }

  const handleUserMenuClose = async (user) => {
    if(user !== null){
      changeUserInfo(user);
      setOpenUserProfile(false);
    }else{
      setOpenUserProfile(false);
    }
  };
  
  const handleCheckToggle = () => {
    localStorage.setItem('toggleBranch', !toggleBranch);
    setToggleBranch(!toggleBranch);
  }

  return (
    <>
    {openUserProfile && (
      <UserInfo onClose={() => setOpenUserProfile(false)} handleSave={handleUserMenuClose}/>
    )}
    {createMenuOn && (
        <ConversationCreate CreateConvo={CreateConvo} setCreateMenuOn={setCreateMenuOn}/>
    )}
    {selectedParticipants.map((participant, index) => (
      <React.Fragment key={index}>
        <Model character={participant} />
        <Avatar
          selectedCharacter={participant}
          emotion={currentEmotion.find(
            (emotion) => emotion.char_id === participant.char_id
          )}
          position={index}
        />
      </React.Fragment>
    ))}
    {openConvoSelector && (
      <ConversationSelectionMenu setConvo={handleSetConversation} handleDelete={handleConversationDelete} handleChatMenuClose={() => setOpenConvoSelector(false)}/>
    )}
    {toggleConnectMenu && (
     <ConnectMenu setToggleConnectMenu={setToggleConnectMenu}/> 
    )}
      <div className="min-h-screen flex justify-center">
        <div className="flex flex-col">
          <div className="mx-auto max-w-full sm:min-w-full">
            <div className="connect-chat-box relative mt-1 flex flex-row items-center rounded-t-lg px-1 selected-bb-color backdrop-blur-md mb-1 h-auto overflow-hidden md:max-w-[750px] md:min-w-[750px] border-2 border-solid border-gray-500">
              <div id="connect-button">
                <button className={'chat-button'} id={'submit'} title={'Connect to Chat'} onClick={() => setToggleConnectMenu(true)}> <VscDebugDisconnect className="react-icon"/></button>
              </div>
              <div id="connect">
                <Connect/>
              </div>
              <div className="ml-1">
              
              <div className="flex flex-col items-center">
              <h4>Enable Message Reordering</h4>
              <div className="flex items-center ml-1">
              <input type='checkbox'className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" name='branchtoggle' checked={toggleBranch} onChange={() => handleCheckToggle()}/>
              </div>
              </div>
          </div>
              <div className="title-wrapper"> 
                {conversation && (
                  <h4
                    className={'chat-title'}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTitleEdit(e.target.innerText)}
                    onKeyDown={(e) => handleMessageKeyDown(e)}
                  >
                    {conversation.conversationName}
                  </h4>
                )}
              </div>
              <div className='chat-management-buttons'>
                <button className={'chat-button'} id={'submit'} title={'Chat Management Menu'} onClick={() => setOpenConvoSelector(true)}><FiList className="react-icon"/></button>
                <button className={'chat-button'} id={'cancel'} title={'Delete Current Chat'} onClick={() => handleConversationDelete(conversation.conversationName)}><FiTrash2 className="react-icon"/></button>
                <button className={'chat-button'} id={'submit'} title={'Create New Chat'} onClick={() => createNewConversation()}><FiPlusCircle className="react-icon"/></button>
                <button className={'chat-button'} id={'submit'} title={'Create Group Chat'} onClick={() => setCreateMenuOn(true)}><FiUsers className='react-icon'/></button>
              </div>
            </div>
            <div className="h-[calc(75vh-7rem)] overflow-x-hidden relative flex flex-col justify-start p-2 selected-bb-color shadow-sm backdrop-blur-md md:max-w-[750px] md:min-w-[750px] md:h-[75vh] border-2 border-solid border-gray-500">
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
                handleOpenUserProfile={handleOpenUserProfile}
                selectedCharacter={userCharacter}
                messages={messages}
                branchingEnabled={toggleBranch}
              />
              ))}
            <div ref={messagesEndRef}></div>
          </div>
          <ChatboxInput onSend={handleUserSend} impersonate={sendImpersonation} userEdit={changeUserInfo}/>
        </div>
      </div>
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