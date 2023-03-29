import React, { useState, useEffect } from "react";
import { fetchConversations, saveConversation } from "../api";
import Conversation from "./Conversation";
import ConversationCreate from "./ConversationCreate";
import {FiPlus} from "react-icons/fi";

const ConversationSelectionMenu = ({ setConvo}) => {
  const [conversations, setConversations] = useState([]);
  const [createMenuOn, setCreateMenuOn] = useState(false);
  
  useEffect(() => {
    const fetchConversationData = async () => {
      const data = await fetchConversations();
      setConversations(data);
    };
    fetchConversationData();
  }, []);

  const CreateConvo = async (convo) => {
    await saveConversation(convo);
    localStorage.setItem('convoName', convo.conversationName);
    setConvo(convo);
  }

  return (
    <>
      <div className="modal-overlay">
        <div className="chat-selection-menu">
            {conversations.length == 0 ? (
              <>
              <h2 className="centered">No Previous Conversations Found</h2>
              </>
            ) : (
              <>
                <h2 className="centered">Select a Conversation</h2>
                <div className="conversation-list">
                  {conversations.map((conversation, index) => (
                  <div className="conversation-item" key={index}>
                    <Conversation conversationName={conversation.conversationName} />
                    <button onClick={() => setConvo(conversation)}>Select</button>
                  </div>
                  ))}
                </div>
              </>
            )}
          <div className='form-bottom-buttons'>
              <button className="icon-button-small" onClick={setCreateMenuOn}><FiPlus className='react-icon'/></button>
          </div>
        </div>
      </div>
      {createMenuOn && (
        <ConversationCreate setConvo={CreateConvo} setCreateMenuOn={setCreateMenuOn}/>
      )}
      
    </>
  );
};

export default ConversationSelectionMenu;
