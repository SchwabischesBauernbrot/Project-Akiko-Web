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
        <div
          key={character.char_id}
          className="character-info-box flex justify-center"
          tabIndex="0" // Add this line to make the div focusable on tap
        >
          <h2>
            <b>{character.name}</b>
          </h2>
          <img
            src={imageUrl}
            title={character.name}
            id="character-avatar"
            onClick={() => openModal(character)}
          />
          <div className="absolute bottom-6 flex justify-center items-center">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 md:gap-1 md:gap-5 lg:gap-14 button-container">
              <button
                className="text-selected-text bg-selected aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer hover:bg-blue-600"
                id="cancel"
                onClick={() => delCharacter(character)}
                title="Delete Character"
              >
                <TrashIcon />
              </button>
              <button
                className="text-selected-text bg-selected aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer hover:bg-blue-600"
                id="select"
                onClick={() => selectCharacter(character)}
                title="Select Character"
              >
                <FiCheck className="react-icon" />
              </button>
              <button
                className="text-selected-text bg-selected aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer hover:bg-blue-600"
                id="select"
                onClick={() => openModal(character)}
                title="View Character Details"
              >
                <InformationCircleIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
);  
};

export default CharacterInfoBox;