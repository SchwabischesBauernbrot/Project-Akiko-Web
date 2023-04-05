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
      <div className="character-form">
        <span className="close" onClick={onClose} style={{cursor: 'pointer'}}>&times;</span>
        <h2 id='charactername-title'>Create New Character</h2>
        <form onSubmit={handleSubmit}>
          <div className='character-form-top-box'>
            <label htmlFor="avatar-field">{!imageUrl && <FiImage id="avatar-default"/>} {imageUrl && <img src={imageUrl} alt="avatar" id="character-avatar-form"/>}</label>
            <input
              id="avatar-field"
              type="file"
              name="characterAvatar"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="character-form-top-right">
              <label><b>Name:</b></label>
              <textarea
                id="name-field"
                className="character-field"
                value={characterName}
                onChange={(event) => setCharacterName(event.target.value)}
                required
              />
              <label><b>Summary:</b></label>
              <textarea
                id="small-field"
                className="character-field"
                value={characterPersonality}
                onChange={(event) => setcharacterPersonality(event.target.value)}
              />
              <label><b>Scenario:</b></label>
              <textarea
                id="small-field"
                className="character-field"
                value={characterScenario}
                onChange={(event) => setCharacterScenario(event.target.value)}
              />
            </div>
            <div className="character-form-top-right">
              <label htmlFor="characterGreeting"><b>Greeting:</b></label>
              <textarea
                id="large-field"
                className="character-field"
                value={characterGreeting}
                onChange={(event) => setCharacterGreeting(event.target.value)}
              />
            </div>
          </div>
          <div className="character-form-bottom">
            <div className="character-form-bottom-box" id='description'>
              <label><b>Description:</b></label>
              <textarea
                id="large-field"
                className="character-field"
                value={characterDescription}
                type="text"
                onChange={(event) => setCharacterDescription(event.target.value)}
              />
            </div>
            <div className="character-form-bottom-box" id='examples'>
              <label><b>Dialogue Examples:</b></label>
              <textarea
                id="large-field"
                className="character-field"
                value={characterExamples}
                type="text"
                onChange={(event) => setCharacterExamples(event.target.value)}
              />
            </div>
          </div>
            <div className="form-bottom-buttons"> 
              <button className="character-button" type="submit" id="character-submit">
                <FiSave className="react-icon"/>
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterForm;