import React, { useState, useEffect } from 'react';
import { fetchConversations } from "./Api";
import Select from 'react-select';

function ConversationSelector({ onConversationSelect, characterName, charAvatar }) {
  const [conversationNames, setConversationNames] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchConversationNames = async () => {
      const data = await fetchConversations(characterName);
      setConversationNames(data.map((name, index) => ({ value: name, label: name, image: charAvatar })));
    };
    handleChange({ value: '', label: 'New Chat', image: charAvatar })
    fetchConversationNames();
  }, [characterName, charAvatar]);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onConversationSelect(selectedOption.value);
  };

  const options = [
    { value: '', label: 'New Chat', image: charAvatar },
    ...conversationNames,
  ];

  return (
    <div>
    <Select
      options={options}
      onChange={handleChange}
      placeholder="Select a chat"
      value={selectedOption}
    />
    </div>
  );
}

export default ConversationSelector;
