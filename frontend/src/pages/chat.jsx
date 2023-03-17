import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/Chatbox'
import Avatar from '../assets/components/Avatar'
import ConversationSelector from '../assets/components/ConversationSelector'
import { fetchCharacter, fetchSettings, getCharacterImageUrl } from "../assets/components/api";
const defaultChar = 1678727433070
const Chat = () => {
const [selectedCharacter, setSelectedCharacter] = useState(null);
const [settings, setSettings] = useState(null);
const [characterAvatar, setCharacterAvatar] = useState(null);
const [selectedConversation, setSelectedConversation] = useState('');

const handleConversationSelect = (conversationName) => {
  setSelectedConversation(conversationName);
};

useEffect(() => {
    const fetchData = async () => {
        var selectedChar = localStorage.getItem('selectedCharacterId');
        setSettings(fetchSettings())
        if (selectedChar) {
            selectedChar = await fetchCharacter(selectedChar);
            setSelectedCharacter(selectedChar); // set the state to the character object
			setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
        } else {
            const customDefault = settings.customDefault
            if (customDefault) {
                selectedChar = await fetchCharacter(customDefault);
                setSelectedCharacter(selectedChar)
				setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
            } else {
                selectedChar = await fetchCharacter(defaultChar);
                setSelectedCharacter(selectedChar)
				setCharacterAvatar(getCharacterImageUrl(selectedChar.avatar));
            }
        }
    }
    fetchData();
}, []);
  
return (
	<div>
		<Avatar/>
        <ConversationSelector onConversationSelect={handleConversationSelect} characterName={selectedCharacter}/>
		<Chatbox selectedCharacter={selectedCharacter} charAvatar={characterAvatar} endpoint={"endpoint"} convoName={selectedConversation}/>
	</div>
);
};

export default Chat;
