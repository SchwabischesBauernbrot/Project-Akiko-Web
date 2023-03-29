import React, { useState, useEffect } from "react";
import { fetchConversations } from "../api";
import Conversation from "./Conversation";
import ConversationCreate from "./ConversationCreate";

const ConversationSelectionMenu = ({characters}) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversationData = async () => {
      const data = await fetchConversations();
      setConversations(data);
    };
    fetchConversationData();
  }, []);
  const CreateConvo = (conversation) => {
    localStorage.setItem('convoName', conversation.conversationName);
    window.location.reload();
  }
  return (
    <>
      <div className="modal-overlay">
        <div className="chat-selection-menu">
          {conversations.length == 0 ? (
            <>
              <h2 className="centered">No Previous Conversations Found</h2>
            <ConversationCreate characters={characters} setConvo={CreateConvo}/>
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
        </div>
      </div>
    </>
  );
};

export default ConversationSelectionMenu;
