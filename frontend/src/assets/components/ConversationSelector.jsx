import React, { useState, useEffect } from 'react';
import { fetchConversations } from "./Api";
import Select from 'react-select';

function ConversationSelector({ onConversationSelect, characterName }) {
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

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(11, 11, 11, 0.636)',
      backdropFilter: 'blur(10px)',
      color: 'white'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'white'
    }),
    container: (provided) => ({
      ...provided,
      color: 'white'
    }),
    control: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(18, 18, 18, 0.737)',
	    boxShadow: '0px 0px 10px 0px rgba(57, 57, 57, 0.737)',
	    backdropFilter: 'blur(11px)',
      color: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      scrollbehavior: 'smooth',
      padding: 'none',
      color: 'white',
    }),
  };
  
  
  const CustomOption = (props) => (
    <Option {...props}>
      {props.data.icon} {props.data.label}
    </Option>
  );
  
  const Menu = ({ innerProps, children }) => {
    return (
      <div
        {...innerProps}
        style={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          border: 'none',
          position: 'absolute',
          zIndex: 1,
          scrollbehavior: 'smooth',
          color: 'black'
        }}
      >
        {children}
      </div>
    );
  };
  

  return (
    
    <div>
    <Select
      options={options}
      onChange={handleChange}
      placeholder="Select a chat"
      value={selectedOption}
      isSearchable={false}
      styles={customStyles}
    />
    </div>
  );
}

export default ConversationSelector;
