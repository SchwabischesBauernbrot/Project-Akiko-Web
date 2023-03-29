import React, { useState, useEffect } from "react";
import { fetchConversation } from "../api";

const Conversation = ({ conversationName }) => {
    const [conversation, setConversation] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
  useEffect(() => {
    const getConversation = async () => {
      const data = await fetchConversation(conversationName);
      setConversation(data);
      if(!data.messages.length == 0){
        setLastMessage(data.messages[data.messages.length - 1]);
      }
    };
    getConversation();
  }, [conversationName]);

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="conversation-container">
        <h2>{conversationName}</h2>
        <p>
          <b>Participants:</b>
        </p>
        {conversation.participants.map((participant, index) => (
          <p key={index}>{participant.name}</p>
        ))}
        <h3>Last Message:</h3>
        <p>
          <b>{lastMessage.sender}:</b>
        </p>
        <p>{lastMessage.text}</p>
      </div>
    </>
  );
};

export default Conversation;