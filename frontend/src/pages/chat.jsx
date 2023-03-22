import React, { useState, useEffect } from "react";
import Chatbox from '../assets/components/Chatbox';
import ConversationSelector from '../assets/components/ConversationSelector';
import DeleteChatButton from '../assets/components/DeleteChatButton';
import { fetchCharacter, fetchSettings, getCharacterImageUrl } from "../assets/components/api";
import "../assets/css/chat.css";

const defaultChar = 'Vapor'
const Chat = () => {
const [selectedCharacter, setSelectedCharacter] = useState(null);
const [settings, setSettings] = useState(null);
const [characterAvatar, setCharacterAvatar] = useState(null);
const [selectedConversation, setSelectedConversation] = useState('');
const [configuredEndpoint, setconfiguredEndpoint] = useState('localhost:5100/');

const handleConversationSelect = (conversationName) => {
  setSelectedConversation(conversationName || null); // Set to null if conversationName is empty
};

useEffect(() => {
    const fetchData = async () => {
        setconfiguredEndpoint(localStorage.getItem('endpoint'));
        var selectedChar = localStorage.getItem('selectedCharacter');
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

const handleDelete = () => {
    setSelectedConversation('')
    window.location.reload();
}

return (
	<div>
        <div className="chat-selection-menu">
        <ConversationSelector onConversationSelect={handleConversationSelect} characterName={selectedCharacter} charAvatar={characterAvatar}/>
        {selectedConversation && (
            <DeleteChatButton
                conversationName={selectedConversation}
                onDelete={handleDelete}
            />
        )};
        </div>
		<Chatbox selectedCharacter={selectedCharacter} charAvatar={characterAvatar} endpoint={configuredEndpoint} convoName={selectedConversation}/>
	</div>
);
};

export default Chat;
