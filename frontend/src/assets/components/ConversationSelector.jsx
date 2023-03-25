import React, { useState, useEffect } from 'react';
import { fetchConversations } from "./Api";
import Select from 'react-select';

function ConversationSelector({ onConversationSelect, characterName, charAvatar }) {
  const [conversationNames, setConversationNames] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchConversationNames = async () => {
      const data = await fetchConversations(characterName);
      setConversationNames(data.map((name, index) => ({ value: name, label: name})));
    };
    fetchConversationNames();
  }, [characterName]);

  useEffect(() => {
    if (conversationNames.length === 0){
      handleChange({ value: '', label: 'New Chat'});
    }
    var convoName = localStorage.getItem('convoName');
    if (convoName != null && conversationNames.some(conversation => conversation.value === convoName)){
      setSelectedOption({value: convoName, label: convoName});
    }else{
      handleChange({ value: '', label: 'New Chat'});
    }
  }, [conversationNames]);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onConversationSelect(selectedOption.value);
  };

  const options = [
    { value: '', label: 'New Chat'},
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
