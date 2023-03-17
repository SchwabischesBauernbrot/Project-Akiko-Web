import React, { useState, useEffect } from 'react';
import { fetchConversations } from "./api";

function ConversationSelector({ onConversationSelect, characterName, charAvatar }) {
  const [conversationNames, setConversationNames] = useState([]);

  useEffect(() => {
    const fetchConversationNames = async () => {
      const data = await fetchConversations(characterName);
      setConversationNames(data);
    };
    fetchConversationNames();
  }, [characterName]);

  const handleChange = (event) => {
    onConversationSelect(event.target.value);
  };

  return (
    <div>
      <select className='chat-select' onChange={handleChange}>
      <option value="">New Chat</option>
      {conversationNames.map((name, index) => (
        <option key={index} value={name}>
          {name}
        </option>
      ))}
    </select>
    </div>

  );
}

export default ConversationSelector;
