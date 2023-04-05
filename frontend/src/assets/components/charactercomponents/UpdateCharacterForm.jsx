import React, { useState, useEffect } from "react";
import { getCharacterImageUrl, exportTavernCharacter, updateCharacter } from "../api";
import { FiSave, FiDownload } from "react-icons/fi";

export const UpdateCharacterForm = ({ character, onUpdateCharacter, onClose, download }) => {
  const [characterName, setCharacterName] = useState(character.name);
  const [characterPersonality, setcharacterPersonality] = useState(character.personality);
  const [characterDescription, setCharacterDescription] = useState(character.description);
  const [characterScenario, setCharacterScenario] = useState(character.scenario);
  const [characterGreeting, setCharacterGreeting] = useState(character.first_mes);
  const [characterExamples, setCharacterExamples] = useState(character.mes_example);
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const closeOnEscapeKey = e => e.key === "Escape" ? onClose() : null;
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
        document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
    }, []);

  useEffect(() => {
    setCharacterName(character.name);
    setCharacterDescription(character.description);
    setcharacterPersonality(character.personality);
    setCharacterScenario(character.scenario);
    setCharacterGreeting(character.first_mes);
    setCharacterExamples(character.mes_example);
    setImageUrl(null);
  }, [character]);

  async function handleSubmit(event) {
    event.preventDefault();

    const updatedCharacter = {
      ...character,
      char_id: character.char_id,
      name: characterName,
      personality: characterPersonality,
      description: characterDescription,
      scenario: characterScenario,
      first_mes: characterGreeting,
      mes_example: characterExamples,
      avatar: characterAvatar || character.avatar,
      // Other form input values
    };
    await editCharacter(updatedCharacter);
    onClose();
  };

  const editCharacter = async (updatedCharacter) => {
    await updateCharacter(updatedCharacter)
    onUpdateCharacter(updatedCharacter)
  };
  
  const handleDownload = () => {
    exportTavernCharacter(character.char_id)
  };

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      setCharacterAvatar(file);
      setImageUrl(URL.createObjectURL(file));
    }
  }
  
  return (
    <div className="modal-overlay">
    <div className="character-form max-w-full gap-1 mx-auto rounded-lg shadow-md backdrop-blur-md p-5 lg:w-4/5 m-auto">
      <span className="close cursor-pointer" onClick={onClose}>&times;</span>
      <h1 className="text-center text-lg sm:text-2xl">{character.name}</h1>
      <form onSubmit={handleSubmit}>
      <div className='flex flex-col lg:flex-row w-full gap-2.5 justify-start items-center mt-auto'>
            <label htmlFor="avatar-field" className="relative cursor-pointer flex-shrink-0">    
            {character.avatar && (
              <>
                {imageUrl !== null ? (
                  <img
                  className="h-32 w-32 sm:h-56 sm:w-56 flex items-center justify-center"
                  src={imageUrl}
                  alt="New avatar"
                  id="character-avatar"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                />
              ) : (
                <img
                id="character-avatar-form" className="flex-shrink-0 h-32 w-32 sm:h-56 sm:w-56 rounded-md overflow-hidden"
                src={getCharacterImageUrl(character.avatar)}
                title="Current avatar"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                />
              )}
            </>
            )}
            </label>
            <input
            id="avatar-field"
            type="file"
            name="characterAvatar"
            accept="image/*"
            className="absolute w-full h-full opacity-0 cursor-pointer top-0 left-0"
            onChange={handleImageChange}
            />
            <div className="w-full gap-1 flex flex-col justify-start mt-0">
              <label className="mb-2 text-xs sm:text-base"><b>Name:</b></label>
              <textarea
                className="character-field w-full h-12 p-1 sm:h-16 sm:p-2 rounded-md resize-none"
                value={characterName}
                type="text"
                onChange={(event) => setCharacterName(event.target.value)}
                required
              />
              <b>CharID:</b> 
              <p id="name-field">{character.char_id}</p>
              <label htmlFor="characterPersonality"><b>Summary:</b></label>
              <textarea
                className="character-field w-full h-12 p-1 sm:h-16 sm:p-2 rounded-md resize-none"
                value={characterPersonality}
                name="characterPersonality"
                type="text"
                onChange={(event) => setcharacterPersonality(event.target.value)}
              />
              <label htmlFor="characterScenario"><b>Scenario:</b></label>
              <textarea
                className="character-field w-full h-12 p-1 sm:h-16 sm:p-2 rounded-md resize-none"
                name="characterScenario"
                value={characterScenario}
                type="text"
                onChange={(event) => setCharacterScenario(event.target.value)}
              />
            </div>
            <div className="w-full gap-2 flex flex-col justify-start mt-auto">
              <label htmlFor="characterGreeting" className="mb-2 text-xs sm:text-base"><b>Greeting:</b></label>
              <textarea
                className="character-field w-full h-48 p-1 sm:h-96 sm:p-2 rounded-md resize-none"
                name="characterGreeting"
                value={characterGreeting}
                type="text"
                onChange={(event) => setCharacterGreeting(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2.5 w-full">
            <div className="character-form-bottom-box w-full justify-start">
            <label className="mb-2 text-xs sm:text-base"><b>Description:</b></label>
              <textarea
                className="character-field w-full h-48 p-1 sm:h-96 sm:p-2 rounded-md resize-none"
                name="characterDescription"
                value={characterDescription}
                type="text"
                onChange={(event) => setCharacterDescription(event.target.value)}
              />
            </div>
            <div className="character-form-bottom-box w-full justify-start">
              <label className="mb-2 text-xs sm:text-base"><b>Dialogue Examples:</b></label>
              <textarea
                className="character-field w-full h-48 p-1 sm:h-96 sm:p-2 rounded-md resize-none"
                name="characterExamples"
                value={characterExamples}
                type="text"
                onChange={(event) => setCharacterExamples(event.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center mt-4 mt-0"> 
            <button className="aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer transition-colors hover:bg-blue-600" type="submit">
              <FiSave className="react-icon"/>
            </button>
            <button className="aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer transition-colors hover:bg-blue-600" id="character-download" alt="Download Character" onClick={handleDownload}>
              <FiDownload className="react-icon"/>
            </button>
          </div>
      </form>
    </div>
  </div>
  );
};

export default UpdateCharacterForm;