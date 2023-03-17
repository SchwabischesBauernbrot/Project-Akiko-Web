import React, { useState, useEffect } from "react";
import { getCharacterImageUrl } from "./api";
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline'
export const UpdateCharacterForm = ({ character, onUpdateCharacter, onClose }) => {
  const [characterName, setCharacterName] = useState(character.char_name);
  const [characterDescription, setCharacterDescription] = useState(character.char_persona);
  const [characterScenario, setCharacterScenario] = useState(character.world_scenario);
  const [characterGreeting, setCharacterGreeting] = useState(character.char_greeting);
  const [characterExamples, setCharacterExamples] = useState(character.example_dialogue);
  const [characterAvatar, setCharacterAvatar] = useState(null);

  useEffect(() => {
    setCharacterName(character.char_name);
    setCharacterDescription(character.char_persona);
    setCharacterScenario(character.world_scenario);
    setCharacterGreeting(character.char_greeting);
    setCharacterExamples(character.example_dialogue);
  }, [character]);

  function handleSubmit(event) {
    event.preventDefault();

    const updatedCharacter = {
      ...character,
      char_id: character.char_id,
      char_name: characterName,
      char_persona: characterDescription,
      world_scenario: characterScenario,
      char_greeting: characterGreeting,
      example_dialogue: characterExamples,
      avatar: characterAvatar || character.avatar,
      // Other form input values
    };
    onUpdateCharacter(updatedCharacter);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="character-form">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{character.char_name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="character-input">
            {character.avatar && (
            <img src={getCharacterImageUrl(character.avatar)} alt="Current avatar" id="character-avatar"/>
            )}
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
            onChange={(event) => setCharacterAvatar(event.target.files[0])}
            />
            <div className="character-buttons">            
              <button type="submit" id="character-submit">
                <b>Update</b>
              </button>
              <button id="character-download" alt="Download Character" onClick={''}>
                <ArrowDownCircleIcon className="w-6 h-6"/>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
