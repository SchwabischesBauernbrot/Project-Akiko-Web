import React, { useState, useEffect } from "react";
import { fetchCharacters, getCharacterImageUrl, deleteCharacter, createCharacter, updateCharacter } from "../assets/components/api";
import { CharacterForm } from "../assets/components/CharacterForm";
import { UpdateCharacterForm } from "../assets/components/UpdateCharacterForm";
import { InformationCircleIcon, TrashIcon, PlusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);

  const fetchAndSetCharacters = async () => {
    try {
      const data = await fetchCharacters();
      setCharacters(data);
      localStorage.setItem('characters', JSON.stringify(data));
    } catch (error) {
      console.error(error);
      window.location.href = '/error';
    }
  };

  useEffect(() => {
    const storedCharacters = localStorage.getItem('characters');
    if (storedCharacters) {
      setCharacters(JSON.parse(storedCharacters));
    } else {
      fetchAndSetCharacters();
    }
  }, []);

  const selectCharacter = async (character) => {
    const charId = character.char_id;
    // Save char_id to localStorage
    localStorage.setItem("selectedCharacterId", charId);
    const item = localStorage.getItem("selectedCharacterId");
    if (item === null) {
      console.log("Character selection failed.");
    } else {
      console.log("Selected Character set to:", item);
      window.location.href = '/chat';
    }
  }

  const openModal = (character) => {
    setSelectedCharacter(character);
  }

  const closeModal = () => {
    setSelectedCharacter(null);
  }

  function addCharacter(newCharacter) {
    createCharacter(newCharacter)
      .then(avatar => {
        setCharacters([...characters, {...newCharacter, avatar: avatar}]);
      })
      .catch(error => {
        console.error(error);
        window.location.href = '/error';
      });
  }

  function editCharacter(updatedCharacter) {
    updateCharacter(updatedCharacter)
      .then(() => {
        const updatedCharacters = characters.map((c) => c.char_id === updatedCharacter.char_id ? updatedCharacter : c);
        setCharacters(updatedCharacters);
        localStorage.setItem('characters', JSON.stringify(updatedCharacters));
        closeModal();
        window.location.reload()
      })
      .catch(error => {
        console.error(error);
        window.location.href = '/error';
      });
  }  
  

  const delCharacter = async (character) => {
    setCharacterToDelete(character);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCharacter(characterToDelete.char_id);
      const updatedCharacters = characters.filter((c) => c.char_id !== characterToDelete.char_id);
      setCharacters(updatedCharacters);
      localStorage.setItem('characters', JSON.stringify(updatedCharacters));
      setShowDeleteModal(false);
      setCharacterToDelete(null);
    } catch (error) {
      console.error(error);
    }
  }

return (
  <div>
    <div className="character-buttons">
      <button id="character-button" onClick={fetchAndSetCharacters} alt="Refresh Character List">
      <ArrowPathIcon className="w-6 h-6"/>
      </button>
      <button id="character-button" onClick={() => setShowForm(true)} alt="Create Character">
        <PlusCircleIcon className="w-6 h-6"/>
      </button>
    </div>
    {showForm && (
      <CharacterForm
        onCharacterSubmit={addCharacter}
        onClose={() => setShowForm(false)}
      />
    )}
    <div className="character-display">
      {characters.map((character) => (
        <div key={character.char_id} className="character-info-box">
          <h2><b>{character.char_name}</b></h2>
          <img
            src={getCharacterImageUrl(character.avatar)}
            alt={character.char_name}
            id="character-avatar"
            onClick={() => openModal(character)}
          />
          <button id="character-close" onClick={() => delCharacter(character)} alt="Delete Character">
            <TrashIcon className="w-6 h-6"/>
          </button>
          <button
              id="character-select"
              onClick={() => selectCharacter(character)}
              alt="Select Character"
            >
              {/* ... SVG for the select character button */}
              <b>Select Character</b>
          </button>
          <button id="character-submit" onClick={() => openModal(character)} alt="View Character Details">
            <InformationCircleIcon className="w-6 h-6"/>
          </button> 
        </div>
      ))}
    </div>
    {selectedCharacter && (
      <UpdateCharacterForm
            character={selectedCharacter}
            onUpdateCharacter={editCharacter}
            onClose={closeModal}
      />
    )}
    {showDeleteModal && (
    <div className="modal-overlay">
    <div className="modal-small-box">
    <h2>Delete Character</h2>
    <p>Are you sure you want to delete {characterToDelete.char_name}?</p>
    <button className="submit-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
    <button className="cancel-button" onClick={handleDelete}>Delete</button>
    </div>
  </div>
  )}
</div>
);
};

export default Characters;
