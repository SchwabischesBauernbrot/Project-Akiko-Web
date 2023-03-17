import React, { useState } from "react";

export const CharacterForm = ({ onCharacterSubmit, onClose }) => {
const [characterName, setCharacterName] = useState('');
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
    char_name: characterName || "Default Name",
    char_persona: characterDescription || "",
    world_scenario: characterScenario || "",
    char_greeting: characterGreeting || "",
    example_dialogue: characterExamples || "",
    avatar: characterAvatar,
    // Other form input values
    };
    onCharacterSubmit(newCharacter);
    // Reset form input values
    setCharacterName('');
    setCharacterDescription('');
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
      setCharacterAvatar(file);
      setImageUrl(URL.createObjectURL(file));
    }
  }
  return (
    <div className="modal-overlay">
      <div className="character-form">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Create New Character</h2>
        <form onSubmit={handleSubmit}>
          <div className="character-input">
            {imageUrl && <img src={imageUrl} alt="avatar" id="character-avatar"/>}
            <label htmlFor="characterName"><b>Name:</b></label>
            <textarea
              id="character-field"
              value={characterName}
              onChange={(event) => setCharacterName(event.target.value)}
              required
            />
            <label htmlFor="characterDescription"><b>Description:</b></label>
            <textarea
              id="character-field"
              value={characterDescription}
              onChange={(event) => setCharacterDescription(event.target.value)}
            />
            <label htmlFor="characterScenario"><b>Scenario:</b></label>
            <textarea
              id="character-field"
              value={characterScenario}
              onChange={(event) => setCharacterScenario(event.target.value)}
            />
            <label htmlFor="characterGreeting"><b>Greeting:</b></label>
            <textarea
              id="character-field"
              value={characterGreeting}
              onChange={(event) => setCharacterGreeting(event.target.value)}
            />
            <label htmlFor="characterExamples"><b>Dialogue Examples:</b></label>
            <textarea
              id="character-field"
              value={characterExamples}
              onChange={(event) => setCharacterExamples(event.target.value)}
            />
            <label htmlFor="characterAvatar"><b>Avatar:</b></label>
            <input
              id="character-field"
              type="file"
              name="characterAvatar"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            <button type="submit" id="character-submit">
              <b>Create</b>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
