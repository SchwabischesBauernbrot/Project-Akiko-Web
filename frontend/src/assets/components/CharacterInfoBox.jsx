import React, { useState, useEffect } from "react";
import { InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getCharacterImageUrl } from "./Api";
import { FiCheck } from "react-icons/fi";
const CharacterInfoBox = ({ Character, openModal, delCharacter, selectCharacter }) => {
    const [character, setCharacter] = useState({});

useEffect(() => {
    setCharacter(Character);
}, [Character]);

return (
    <>
    {character && (
    <div key={character.char_id} className="character-info-box">
        <h2><b>{character.name}</b></h2>
        <img
        src={getCharacterImageUrl(character.avatar)}
        title={character.name}
        id="character-avatar"
        onClick={() => openModal(character)}
        />
        <div className="character-info-buttons">
            <button className="character-button" id="character-close" onClick={() => delCharacter(character)} title="Delete Character">
            <TrashIcon/>
            </button>
            <button className="character-button" id="character-select" onClick={() => selectCharacter(character)} title="Select Character">
                <FiCheck className="react-icon"/>
            </button>
            <button className="character-button" id="character-info" onClick={() => openModal(character)} title="View Character Details">
            <InformationCircleIcon/>
            </button>
        </div> 
    </div>
    )

    }
    </>
);
};

export default CharacterInfoBox;