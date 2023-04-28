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
    const participants = selectedParticipants.map(option => ({
        characterName: option.label,
        char_id: option.value
    }));
    event.preventDefault();
    if(conversationName === '' || participants.length <= 0){
        return;
    }
    if(participants.length > 1){
        const groupChatMessage = {
            sender: 'ProjectAkiko',
            avatar: 'icon.png',
            isIncoming: true,
            text: 'This is a group chat. Say hi to everyone!',
            image: null,
            timestamp: new Date().getTime(),
        }
        const NewConvo = {
            conversationName: conversationName,
            participants: participants,
            messages: [groupChatMessage],
        }
        CreateConvo(NewConvo);
        localStorage.setItem('conversationName', conversationName);
        setCreateMenuOn(false);
        return;
    }else{
        let configuredName = 'You';
        const matchingCharacter = characters.find(character => character.char_id === participants[0].char_id);
        if(localStorage.getItem('configuredName') !== null) {
            configuredName = localStorage.getItem('configuredName');
        }
        const defaultMessage = {
            sender: matchingCharacter.name,
            text: matchingCharacter.first_mes.replace('<USER>', configuredName).replace('{{char}}', matchingCharacter.name).replace('{{user}}', configuredName).replace('{{CHAR}}', matchingCharacter.name).replace('{{USER}}', configuredName),
            avatar: getCharacterImageUrl(matchingCharacter.avatar),
            isIncoming: true,
            timestamp: Date.now(),
          };
        const NewConvo = {
            conversationName: conversationName,
            participants: participants,
            messages: [defaultMessage],
        }
        localStorage.setItem('selectedCharacter', matchingCharacter.char_id);
        CreateConvo(NewConvo);
        localStorage.setItem('conversationName', conversationName);
        setCreateMenuOn(false);
        return;
    }
    };
    

    // Map characters to the format required by react-select
    const characterOptions = characters.map((character) => ({
        value: character.char_id,
        label: character.name,
        avatar: character.avatar,
    }));

    const formatOptionLabel = ({ label, avatar }) => (
    <div className='flex items-center space-x-2'>
        <img className='rounded-full object-cover w-8 h-8' src={getCharacterImageUrl(avatar)} title={label} alt='avatar'/>
        <div className='font-medium text-white'>
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
            color: 'black',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(11, 11, 11, 0.636)',
            color: 'white',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'black'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'gray'
        }),
    };
    
    

return (
<div className='modal-overlay'>
    <div className='absolute top-0 left-0 right-0 bottom-0'></div>
    <div className='relative bg-selected-bb rounded-lg z-50'>
        <span className="absolute top-0 right-0 p-4 text-xl font-bold cursor-pointer hover:text-red-600" onClick={handleCancelCreateConversation}>&times;</span>
        <h2 className="text-white text-center text-2xl font-semibold py-4">Create Group Conversation</h2>
        <div className="create-menu-wrapper px-6 py-4">
            <form onSubmit={handleCreateConversationSubmit}>
                <div className='mb-4'>
                    <label className='block text-white font-medium mb-2'>Conversation Name:</label>
                    <input className='shadow appearance-none border-2 border-solid border-gray-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' type="text" value={conversationName} onChange={handleConversationNameChange}/>
                </div>
                <div className='mb-4'>
                    <label className='block text-white font-medium mb-2'>Participants:</label>
                    <Select
                    isMulti
                    options={characterOptions}
                    formatOptionLabel={formatOptionLabel}
                    onChange={handleParticipantsChange}
                    value={selectedParticipants}
                    styles={customStyles}
                    />
                </div>
                <div className="form-bottom-buttons flex justify-end space-x-2">
                    <button className='text-selected-text bg-selected border-2 border-solid border-gray-500 hover:bg-red-600 py-2 px-4 rounded' type="button" id='cancel' onClick={handleCancelCreateConversation}>
                        <ImCancelCircle className='w-6 h-6'/>
                        <span className='sr-only'>Cancel</span>
                    </button>
                    <button className='text-selected-text bg-selected border-2 border-solid border-gray-500 hover:bg-blue-600 py-2 px-4 rounded' id='submit' type="submit">
                        <FiSave className='w-6 h-6'/>
                        <span className='sr-only'>Save</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
);
}
export default ConversationCreate;