import React, { useState, useEffect } from "react";

const ConversationSelectionMenu = ({ conversations, selectConversation }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    selectConversation(conversation);
  };

  return (
    <div className="conversation-selector">
      <h2>Conversations</h2>
      <ul>
        {conversations.map((conversation) => (
          <li
            key={conversation.conversation_id}
            className={
              selectedConversation &&
              selectedConversation.conversation_id === conversation.conversation_id
                ? "selected"
                : ""
            }
            onClick={() => handleSelectConversation(conversation)}
          >
            {conversation.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ConversationSelectionMenu;