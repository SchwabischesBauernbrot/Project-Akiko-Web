import React, { useState, useEffect } from "react";
import { InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getCharacterImageUrl, imageExists } from "../api";
import { FiCheck } from "react-icons/fi";
const CharacterInfoBox = ({ Character, openModal, delCharacter, selectCharacter }) => {
    const [character, setCharacter] = useState({});
    const [imageUrl, setImageUrl] = useState(null);

useEffect(() => {
    async function fetchImageUrl() {
    const url = getCharacterImageUrl(Character.avatar);
    const exists = await imageExists(url);
    if (exists) {
        setImageUrl(url);
    } else {
        setImageUrl(getCharacterImageUrl('default.png'));
    }
    }

    fetchImageUrl();
}, [Character]);

useEffect(() => {
    setCharacter(Character);
}, [Character]);

return (
    <>
      {character && (
        <div key={character.char_id} className="character-info-box">
          <h2>
            <b>{character.name}</b>
          </h2>
          <img
            src={imageUrl}
            title={character.name}
            id="character-avatar"
            onClick={() => openModal(character)}
          />
          <div className="character-info-buttons">
            <button
              className="character-button"
              id="character-close"
              onClick={() => delCharacter(character)}
              title="Delete Character"
            >
              <TrashIcon />
            </button>
            <button
              className="character-button"
              id="character-select"
              onClick={() => selectCharacter(character)}
              title="Select Character"
            >
              <FiCheck className="react-icon" />
            </button>
            <button
              className="character-button"
              id="character-info"
              onClick={() => openModal(character)}
              title="View Character Details"
            >
              <InformationCircleIcon />
            </button>
          </div>
        </div>
      )}
    </>
);  
};

export default CharacterInfoBox;