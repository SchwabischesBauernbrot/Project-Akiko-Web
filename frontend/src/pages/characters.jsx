import React, { useState, useEffect } from "react";
import { fetchCharacters, getCharacterImageUrl, deleteCharacter, createCharacter, updateCharacter, uploadTavernCharacter } from "../assets/components/api";
import { CharacterForm } from "../assets/components/charactercomponents/CharacterForm";
import { UpdateCharacterForm } from "../assets/components/charactercomponents/UpdateCharacterForm";
import { InformationCircleIcon, TrashIcon, PlusCircleIcon, ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import CharacterInfoBox from "../assets/components/charactercomponents/CharacterInfoBox";
import { FiShuffle } from "react-icons/fi";
import 'tailwindcss/tailwind.css';

const Characters = () => {
  const [searchTerm, setSearchTerm] = useState("");
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
      try {
        const storedCharacters = localStorage.getItem('characters');
        setCharacters(JSON.parse(storedCharacters));
      } catch {
        console.log("No characters in local storage.");
      }
      const data = await fetchCharacters();
      setCharacters(data);
      localStorage.setItem('characters', JSON.stringify(data));
    } catch (error) {
      console.error(error);
      if(localStorage.getItem('characters') === null) {
        console.log("No characters in local storage.");
      }else{
        console.log("Characters loaded from local storage.");
        const storedCharacters = localStorage.getItem('characters');
        setCharacters(JSON.parse(storedCharacters));
      }
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
      });
  };
  
  const editCharacter = (updatedCharacter) => {
    const updatedCharacters = characters.map((c) => c.char_id === updatedCharacter.char_id ? updatedCharacter : c);
    setCharacters(updatedCharacters);
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
  const pickRandomChar = async () => {
    try {
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      selectCharacter(randomChar);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full flex justify-center mb-6">
        <div className="grid grid-cols-6 gap-0">
          <button className="character-button" onClick={refresh} title="Refresh Character List">
            <div className="character-button-content">
              <ArrowPathIcon className="hero-icon"/>
            </div>
          </button>
          <button className="character-button" onClick={() => setShowForm(true)} title="Create Character">
            <PlusCircleIcon className="hero-icon"/>
          </button>
          <label htmlFor="character-image-input" className="character-button" title="Import Character Card" style={{ cursor: 'pointer' }}>
            <ArrowUpTrayIcon className="hero-icon"/>
          </label>
          <button className="character-button" onClick={() => pickRandomChar()} title="Create Character">
            <FiShuffle className="react-icon"/>
          </button>
          <input
            type="file"
            accept="image/png"
            id="character-image-input"
            onChange={(e) => handleImageUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <div className="chara-search-bar col-span-2">
            <input
              type="text"
              placeholder="Search characters"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
          {characters &&
            characters
              .filter((character) => {
                return Object.values(character).some((value) =>
                  value
                    .toString()
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                );
              })
              .map((character) => (
                <CharacterInfoBox key={character.char_id} Character={character} openModal={openModal} delCharacter={delCharacter} selectCharacter={selectCharacter}/>
          ))}
        </div>
      </div>
      {showForm && (
        <CharacterForm
          onCharacterSubmit={addCharacter}
          onClose={() => setShowForm(false)}
        />
      )}
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
            <h2 className="centered">Delete Character</h2>
            <p className="centered">Are you sure you want to delete {characterToDelete.name}?</p>
            <button className="submit-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="cancel-button" onClick={() => handleDelete()}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Characters;
