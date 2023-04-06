import React, { useState, useEffect } from "react";
import { fetchConversations, saveConversation, fetchConversation, deleteConversation } from "../api";
import Conversation from "./Conversation";
import {FiPlus, FiTrash2} from "react-icons/fi";

const ConversationSelectionMenu = ({setConvo, handleChatMenuClose}) => {
  const [conversations, setConversations] = useState([]);
  
  const fetchConversationData = async () => {
    const data = await fetchConversations();
    setConversations(data);
  };
  
  useEffect(() => {
    fetchConversationData();
  }, []);

  const handleSetConversation = async (convo) => {
    localStorage.setItem('conversationName', convo);
    const conversation = await fetchConversation(convo);
    setConvo(conversation);
    handleChatMenuClose();
  }

  const handleDeleteConversation = async (convo) => {
    await deleteConversation(convo);
    fetchConversationData();
  }

  return (
    <>
      <div className="modal-overlay">
        <div className="chat-selection-menu">
          <div className="chat-menu-content">
            {conversations.length == 0 ? (
              <>
              <span id='convo-close' className="close" onClick={handleChatMenuClose} style={{cursor: 'pointer'}}>&times;</span>
              <h2 className="centered">No Previous Conversations Found</h2>
              </>
            ) : (
              <>
              <span id='convo-close' className="close" onClick={handleChatMenuClose} style={{cursor: 'pointer'}}>&times;</span>
                <h2 className="centered">Select a Conversation</h2>
                <div className="conversation-list">
                  {conversations.map((conversation, index) => (
                  <div className="conversation-container" key={index}>
                    <Conversation conversation={conversation} />
                    <button className='chat-management-button' id='submit' onClick={() => handleSetConversation(conversation)}><FiPlus className="react-icon"/></button>
                    <button className='chat-management-button' id='cancel' onClick={() => handleDeleteConversation(conversation)}><FiTrash2 className="react-icon"/></button>
                  </div>
                  ))}
                </div>
              </>
            )}
            <span id="convo-close" className="close" onClick={handleChatMenuClose} style={{ cursor: "pointer" }}>
              &times;
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSelectionMenu;
