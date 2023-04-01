import React, { useState, useEffect } from "react";
import { fetchConversation } from "../api";
import ReactMarkdown from "react-markdown";

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
    <>
      <div className="conversation-info">
          <b>{convo.conversationName}</b>
          <p>Participants:</p>
        {convo.participants && convo.participants.map((participant, index) => (
          <p key={index}>{participant}</p>
        ))}
        {lastMessage ? (
          <>
            <b>{lastMessage.sender}:</b>
            <ReactMarkdown className="message-text" components={{em: ({node, ...props}) => <i style={{color: 'rgb(211, 211, 211)'}} {...props} />}}>{lastMessage.text}</ReactMarkdown>
          </>
        ) : (
          <p>No messages in this conversation</p>
        )}
      </div>
    </>
  );
};

export default Conversation;
