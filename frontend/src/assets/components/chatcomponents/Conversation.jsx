import React, { useState, useEffect } from "react";
import { fetchConversation } from "../api";
import ReactMarkdown from "react-markdown";
import { convertToReadableDateTime } from "../miscfunctions";
const Conversation = ({ conversation }) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [convo, setConvo] = useState(null);

  useEffect(() => {
    const getConversation = async () => {
      const convo = await fetchConversation(conversation);
      setConvo(convo);
      if (convo && convo.messages && convo.messages.length !== 0) {
        setLastMessage(convo.messages[convo.messages.length - 1]);
      }
    };
    getConversation();
  }, [conversation]);

  if (convo === null) {
    return <p>Loading...</p>;
  }

  return (
  <div className="conversation-info">
      <b>{convertToReadableDateTime(convo.conversationName)}</b>
      <p><b>Participants:</b></p>
      <div className="participant-list">
      {convo.participants && convo.participants.map((participant, index) => (
          <p key={index}>{participant.characterName}</p>
      ))}
      </div>
      {lastMessage ? (
          <>
            <p><b>Last message:</b></p>
            <em>{lastMessage.sender}:</em>
            <ReactMarkdown components={{em: ({node, ...props}) => <i style={{color: 'rgb(211, 211, 211)'}} {...props} />}}>{lastMessage.text}</ReactMarkdown>
          </>
      ) : (
          <p>No messages in this conversation</p>
      )}
  </div>
  );
};

export default Conversation;
