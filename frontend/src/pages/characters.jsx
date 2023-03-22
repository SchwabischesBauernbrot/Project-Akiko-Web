import React, { useState, useEffect } from "react";
import "../assets/css/character.css";
import { fetchCharacters, getCharacterImageUrl, deleteCharacter, createCharacter, updateCharacter, uploadTavernCharacter } from "../assets/components/Api";
import { CharacterForm } from "../assets/components/CharacterForm";
import { UpdateCharacterForm } from "../assets/components/UpdateCharacterForm";
import { InformationCircleIcon, TrashIcon, PlusCircleIcon, ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

const Characters = () => {
  const [characters, setCharacters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);

  const handleImageUpload = async (file) => {
    const importData = await uploadTavernCharacter(file);
    setCharacters([...characters, {...importData}]);
  }

  const fetchAndSetCharacters = async () => {
    try {
      const storedCharacters = localStorage.getItem('characters');
      setCharacters(JSON.parse(storedCharacters));
      const data = await fetchCharacters();
      setCharacters(data);
      localStorage.setItem('characters', JSON.stringify(data));
    } catch (error) {
      console.error(error);
      //window.location.href = '/error';
      const storedCharacters = localStorage.getItem('characters');
      setCharacters(JSON.parse(storedCharacters));
    }
  };

  
  useEffect(() => {
    fetchAndSetCharacters();
  }, []);

  const selectCharacter = async (character) => {
    const charId = character.char_id;
    // Save char_id to localStorage
    localStorage.setItem("selectedCharacter", charId);
    const item = localStorage.getItem("selectedCharacter");
    if (item === null) {
      console.log("Character selection failed.");
    } else {
      console.log("Selected Character set to:", item);
      window.location.href = '/chat';
    }
  };

  const openModal = (character) => {
    setSelectedCharacter(character);
  };

  const closeModal = () => {
    setSelectedCharacter(null);
  };

  function addCharacter(newCharacter) {
    createCharacter(newCharacter)
      .then(avatar => {
        setCharacters([...characters, {...newCharacter, avatar: avatar}]);
      })
      .catch(error => {
        console.error(error);
        //window.location.href = '/error';
      });
  };

  const editCharacter = async (updatedCharacter) => {
    updateCharacter(updatedCharacter)
      .then(() => {
        const updatedCharacters = characters.map((c) => c.char_id === updatedCharacter.char_id ? updatedCharacter : c);
        setCharacters(updatedCharacters);
        window.location.reload();
      })
      .catch(error => {
        console.error(error);
        //window.location.href = '/error';
      });
  }; 

  const delCharacter = async (character) => {
    setCharacterToDelete(character);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCharacter(characterToDelete.char_id);
      const updatedCharacters = characters.filter((c) => c.char_id !== characterToDelete.char_id);
      setCharacters(updatedCharacters);
      setShowDeleteModal(false);
      setCharacterToDelete(null);
      fetchAndSetCharacters();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const refresh = async () => {
    try {
      fetchAndSetCharacters();
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

return (
  <div className="container">
    <div className="character-buttons">
      <button id="character-button" onClick={refresh} title="Refresh Character List">
        <ArrowPathIcon className="w-6 h-6"/>
      </button>
      <button id="character-button" onClick={() => setShowForm(true)} title="Create Character">
        <PlusCircleIcon className="w-6 h-6"/>
      </button>
      <label htmlFor="character-image-input" id="character-button" title="Import Character Card" style={{ cursor: 'pointer' }}>
        <ArrowUpTrayIcon className="w-6 h-6"/>
      </label>
      <input
        type="file"
        accept="image/png"
        id="character-image-input"
        onChange={(e) => handleImageUpload(e.target.files[0])}
        style={{ display: 'none' }}
      />
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
          <h2><b>{character.name}</b></h2>
          <img
            src={getCharacterImageUrl(character.avatar)}
            title={character.name}
            id="character-avatar"
            onClick={() => openModal(character)}
          />
          <button id="character-close" onClick={() => delCharacter(character)} title="Delete Character">
            <TrashIcon className="w-6 h-6"/>
          </button>
          <button
              id="character-select"
              onClick={() => selectCharacter(character)}
              title="Select Character"
            >
              <b>Select Character</b>
          </button>
          <button id="character-info" onClick={() => openModal(character)} title="View Character Details">
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
        <p>Are you sure you want to delete {characterToDelete.name}?</p>
        <button className="submit-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
        <button className="cancel-button" onClick={handleDelete}>Delete</button>
      </div>
    </div>
   )}
  </div>
);
};

export default Characters;
