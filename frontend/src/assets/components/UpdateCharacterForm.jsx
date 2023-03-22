import React, { useState, useEffect } from "react";
import { getCharacterImageUrl, exportTavernCharacter } from "./api";
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline'
export const UpdateCharacterForm = ({ character, onUpdateCharacter, onClose }) => {
  const [characterName, setCharacterName] = useState(character.name);
  const [characterPersonality, setcharacterPersonality] = useState(character.personality);
  const [characterDescription, setCharacterDescription] = useState(character.description);
  const [characterScenario, setCharacterScenario] = useState(character.scenario);
  const [characterGreeting, setCharacterGreeting] = useState(character.first_mes);
  const [characterExamples, setCharacterExamples] = useState(character.mes_example);
  const [characterAvatar, setCharacterAvatar] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    setCharacterName(character.name);
    setCharacterDescription(character.description);
    setcharacterPersonality(character.personality);
    setCharacterScenario(character.scenario);
    setCharacterGreeting(character.first_mes);
    setCharacterExamples(character.mes_example);
    setImageUrl(null);
  }, [character]);

  function handleSubmit(event) {
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
    onUpdateCharacter(updatedCharacter);
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
      <h2>{character.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="character-input">
          {character.avatar && (
          <>
            {imageUrl !== null ? (
              <img src={imageUrl} alt="New avatar" id="character-avatar" />
            ) : (
              <img src={getCharacterImageUrl(character.avatar)} title="Current avatar" id="character-avatar" />
            )}
          </>
          )}
          <label htmlFor="characterName"><b>Name:</b></label>
          <textarea
            id="character-field"
            value={characterName}
            type="text"
            onChange={(event) => setCharacterName(event.target.value)}
            required
          />
          <label htmlFor="characterPersonality"><b>Summary:</b></label>
          <textarea
            id="character-field"
            value={characterPersonality}
            type="text"
            onChange={(event) => setcharacterPersonality(event.target.value)}
          />
          <label htmlFor="characterDescription"><b>Description:</b></label>
          <textarea
            id="character-field"
            value={characterDescription}
            type="text"
            onChange={(event) => setCharacterDescription(event.target.value)}
          />
          <label htmlFor="characterScenario"><b>Scenario:</b></label>
          <textarea
            id="character-field"
            value={characterScenario}
            type="text"
            onChange={(event) => setCharacterScenario(event.target.value)}
          />
          <label htmlFor="characterGreeting"><b>Greeting:</b></label>
          <textarea
            id="character-field"
            value={characterGreeting}
            type="text"
            onChange={(event) => setCharacterGreeting(event.target.value)}
          />
          <label htmlFor="characterExamples"><b>Dialogue Examples:</b></label>
          <textarea
            id="character-field"
            value={characterExamples}
            type="text"
            onChange={(event) => setCharacterExamples(event.target.value)}
          />
          <label htmlFor="characterAvatar"><b>Avatar:</b></label>
          <input
          id="character-field"
          type="file"
          name="characterAvatar"
          accept="image/*"
          onChange={handleImageChange}
          />
          <div className="character-buttons">            
            <button type="submit" id="character-submit">
              <b>Update</b>
            </button>
            <button
              id="character-download"
              alt="Download Character"
              onClick={() => exportTavernCharacter(character.char_id)}
            >
              <ArrowDownCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  );
};
