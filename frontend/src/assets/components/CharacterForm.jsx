import React, { useState } from "react";
import { FiSave, FiImage } from 'react-icons/fi';

export const CharacterForm = ({ onCharacterSubmit, onClose }) => {
  const [characterName, setCharacterName] = useState('');
  const [characterPersonality, setcharacterPersonality] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterScenario, setCharacterScenario] = useState('');
  const [characterGreeting, setCharacterGreeting] = useState('');
  const [characterExamples, setCharacterExamples] = useState('');
const [characterAvatar, setCharacterAvatar] = useState(null);
const [imageUrl, setImageUrl] = useState(null);

function handleSubmit(event) {
    event.preventDefault();

    const newCharacter = {
    char_id: Date.now(),
    name: characterName || "Default Name",
    personality: characterPersonality || "",
    description: characterDescription || "",
    scenario: characterScenario || "",
    first_mes: characterGreeting || "",
    mes_example: characterExamples || "",
    avatar: characterAvatar,
    // Other form input values
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
  };

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
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Create New Character</h2>
        <form onSubmit={handleSubmit}>
        <label htmlFor="avatar-field">{!imageUrl && <FiImage id="avatar-default"/>} {imageUrl && <img src={imageUrl} alt="avatar" id="character-avatar"/>}</label>
        <input
          id="avatar-field"
          type="file"
          name="characterAvatar"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
          <div className="character-input">
            <label htmlFor="characterName"><b>Name:</b></label>
            <textarea
              className="character-field"
              value={characterName}
              type="text"
              onChange={(event) => setCharacterName(event.target.value)}
              required
            />
            <label htmlFor="characterDescription"><b>Summary:</b></label>
            <textarea
              className="character-field"
              value={characterPersonality}
              onChange={(event) => setcharacterPersonality(event.target.value)}
            />
            <label htmlFor="characterDescription"><b>Description:</b></label>
            <textarea
              className="character-field"
              value={characterDescription}
              type="text"
              onChange={(event) => setCharacterDescription(event.target.value)}
            />
            <label htmlFor="characterScenario"><b>Scenario:</b></label>
            <textarea
              className="character-field"
              value={characterScenario}
              type="text"
              onChange={(event) => setCharacterScenario(event.target.value)}
            />
            <label htmlFor="characterGreeting"><b>Greeting:</b></label>
            <textarea
              className="character-field"
              value={characterGreeting}
              type="text"
              onChange={(event) => setCharacterGreeting(event.target.value)}
            />
            <label htmlFor="characterExamples"><b>Dialogue Examples:</b></label>
            <textarea
              className="character-field"
              value={characterExamples}
              type="text"
              onChange={(event) => setCharacterExamples(event.target.value)}
            />
            <div className="form-bottom-buttons">
            <button type="submit" id="character-submit">
              <FiSave size={35}/>
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
