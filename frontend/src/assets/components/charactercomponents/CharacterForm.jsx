import React, { useState, useEffect } from "react";
import { FiSave, FiImage } from 'react-icons/fi';
import { getCharacterImageUrl } from '../api';
export const CharacterForm = ({ onCharacterSubmit, onClose }) => {
  const [characterName, setCharacterName] = useState('');
  const [characterPersonality, setcharacterPersonality] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterScenario, setCharacterScenario] = useState('');
  const [characterGreeting, setCharacterGreeting] = useState('');
  const [characterExamples, setCharacterExamples] = useState('');
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const closeOnEscapeKey = e => e.key === "Escape" ? onClose() : null;
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
        document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, []);
  
  async function handleSubmit(event) {
    event.preventDefault();
  
    // Check for characterAvatar and call getDefaultImage() if necessary
  
    const newCharacter = {
      char_id: Date.now(),
      name: characterName || "Default Name",
      personality: characterPersonality || "",
      description: characterDescription || "",
      scenario: characterScenario || "",
      first_mes: characterGreeting || "",
      mes_example: characterExamples || "",
      avatar: characterAvatar,
    };
  
    onCharacterSubmit(newCharacter);
  
    // Reset form input values
    setCharacterName('');
    setCharacterDescription('');
    setcharacterPersonality('');
    setCharacterScenario('');
    setCharacterGreeting('');
    setCharacterExamples('');
    setCharacterAvatar(null);
    setImageUrl(null);
    onClose();
  }
  

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCharacterAvatar(file);
      setImageUrl(imageUrl);
    } else {
      setCharacterAvatar(null);
      setImageUrl(null);
    }
  }
  
  return (
    <div className="modal-overlay">
      <div className="character-form max-w-full gap-1 mx-auto rounded-lg shadow-md backdrop-blur-md p-5 lg:w-4/5 m-auto">
        <span className="close cursor-pointer" onClick={onClose}>&times;</span>
        <h1 className="text-center text-lg sm:text-2xl"><b>Create New Character</b></h1>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col lg:flex-row w-full gap-2.5 justify-start items-center mt-auto'>
            <label htmlFor="avatar-field" className="relative cursor-pointer flex-shrink-0">
              {!imageUrl && <FiImage id="avatar-default" className="h-32 w-32 sm:h-56 sm:w-56 flex items-center justify-center"/>} 
              {imageUrl && <img src={imageUrl} alt="avatar" id="character-avatar-form" className="flex-shrink-0 h-32 w-32 sm:h-56 sm:w-56 rounded-md overflow-hidden"/>}
              <input
                id="avatar-field"
                type="file"
                name="characterAvatar"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute w-full h-full opacity-0 cursor-pointer top-0 left-0"
              />
            </label>
            <div className="w-full gap-1 flex flex-col justify-start mt-0">
              <label className="mb-2 text-xs sm:text-base"><b>Name:</b></label>
              <textarea
                className="character-field w-full h-12 p-1 sm:h-16 sm:p-2 rounded-md resize-none"
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
                required
              />
              <label className="mb-2 text-xs sm:text-base"><b>Summary:</b></label>
              <textarea
                className="character-field w-full h-12 p-1 sm:h-16 sm:p-2 rounded-md resize-none"
                value={characterPersonality}
                onChange={(event) => setcharacterPersonality(event.target.value)}
              />
              <label className="mb-2 text-xs sm:text-base"><b>Scenario:</b></label>
              <textarea
                className="character-field w-full h-12 p-1 sm:h-16 sm:p-2 rounded-md resize-none"
                value={characterScenario}
                onChange={(event) => setCharacterScenario(event.target.value)}
              />
            </div>
            <div className="w-full gap-2 flex flex-col justify-start mt-auto">
              <label htmlFor="characterGreeting" className="mb-2 text-xs sm:text-base"><b>Greeting:</b></label>
              <textarea
                className="character-field w-full h-48 p-1 sm:h-96 sm:p-2 rounded-md resize-none"
                value={characterGreeting}
                onChange={(event) => setCharacterGreeting(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-2.5 w-full">
            <div className="character-form-bottom-box w-full justify-start">
              <label className="mb-2 text-xs sm:text-base"><b>Description:</b></label>
              <textarea
                className="character-field w-full h-48 p-1        sm:h-96 sm:p-2 rounded-md resize-none"
                value={characterDescription}
                type="text"
                onChange={(event) => setCharacterDescription(event.target.value)}
              />
            </div>
            <div className="character-form-bottom-box w-full justify-start">
              <label className="mb-2 text-xs sm:text-base"><b>Dialogue Examples:</b></label>
              <textarea
                className="character-field w-full h-48 p-1 sm:h-96 sm:p-2 rounded-md resize-none"
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
          </div>
      </form>
    </div>
  </div>
  );
};

export default CharacterForm;