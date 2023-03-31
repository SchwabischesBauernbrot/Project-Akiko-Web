import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getCharacterImageUrl, fetchCharacters } from "../api";
import { FiSave } from "react-icons/fi";
import { ImCancelCircle } from "react-icons/im";

const ConversationCreate = ({ CreateConvo, setCreateMenuOn }) => {
    const [conversationName, setConversationName] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [characters, setCharacters] = useState([]);

    const fetchAndSetCharacters = async () => {
        if(characters && characters.length <= 0){
          const data = await fetchCharacters();
          if(data !== null){
            setCharacters(data);
          }
        }
    };

    useEffect(() => {
        fetchAndSetCharacters();
    }, []);

    const handleConversationNameChange = (event) => {
    setConversationName(event.target.value);
    };

    const handleParticipantsChange = (selectedOptions) => {
        setSelectedParticipants(selectedOptions);
    };

    const handleCancelCreateConversation = () => {
        setCreateMenuOn(false);
    };

    const handleCreateConversationSubmit = (event) => {
    const participants = selectedParticipants.map(option => option.value);
    event.preventDefault();
    if(conversationName === '' || participants.length <= 0){
        return;
    }
    if(participants.length > 1){
        const groupChatMessage = {
            sender: 'ProjectAkiko',
            avatar: 'system',
            text: 'This is a group chat. You can add more participants by clicking the + button in the top right corner.',
            image: null,
            timestamp: new Date().getTime(),
        }
    }
    const NewConvo = {
        conversationName: conversationName,
        participants: participants,
        messages: [],
    }
    CreateConvo(NewConvo);
    localStorage.setItem('conversationName', conversationName);
    setCreateMenuOn(false);
    };
    

    // Map characters to the format required by react-select
    const characterOptions = characters.map((character) => ({
        value: character.char_id,
        label: character.name,
        avatar: character.avatar,
    }));

    const formatOptionLabel = ({ label, avatar }) => (
    <div style={{marginLeft : 'auto', marginRight : 'auto', padding: '1rem'}}>
    <div className='incoming-avatar'>
        <img src={getCharacterImageUrl(avatar)} title={label}/>
    </div>
    <div className='sender-name'>
    {label}
    </div>
    </div>
    );

    const customStyles = {
        menu: (provided) => ({
            ...provided,
            width: 'fit-content',
            backgroundColor: 'rgba(11, 11, 11, 0.636)',
            backdropFilter: 'blur(10px)',
            color: 'white'
        }),
        singleValue: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(11, 11, 11, 0.636)',
            backdropFilter: 'blur(10px)',
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
            width: 'fit-content',
            backgroundColor: 'rgba(18, 18, 18, 0.737)',
            boxShadow: '0px 0px 10px 0px rgba(57, 57, 57, 0.737)',
            backdropFilter: 'blur(11px)',
            scrollbehavior: 'smooth',
            color: 'white',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(11, 11, 11, 0.636)',
            color: 'white',
        }),
      };

return (
<div className='modal-overlay'>
    <div className='create-conversation-menu'>
        <h2 className="centered">Create Conversation</h2>
        <form>
            <label>Conversation Name:</label>
            <input className='character-input' type="text" value={conversationName} onChange={handleConversationNameChange} />
            <label>Participants:</label>
            <Select
            isMulti
            options={characterOptions}
            formatOptionLabel={formatOptionLabel}
            onChange={handleParticipantsChange}
            value={selectedParticipants}
            styles={customStyles}
            />
            <div className="form-bottom-buttons">
            <button className='icon-button-small' type="button" id='cancel' onClick={handleCancelCreateConversation}>
            <ImCancelCircle className='react-icon'/>
            </button>
            <button className='icon-button-small' id='submit' type="submit" onClick={handleCreateConversationSubmit}>
            <FiSave className='react-icon'/>
            </button>
            </div>
        </form>
    </div>
</div>
);
}
export default ConversationCreate;