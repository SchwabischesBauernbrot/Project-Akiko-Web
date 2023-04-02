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
    <div className="character-form">
      <span className="close" onClick={onClose} style={{cursor: 'pointer'}}>&times;</span>
      <h2 id='charactername-title'>{character.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className='character-form-top-box'>
          <label htmlFor="avatar-field">          
            {character.avatar && (
              <>
                  {imageUrl !== null ? (
                    <img
                    src={imageUrl}
                    alt="New avatar"
                    id="character-avatar"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  />
                ) : (
                  <img
                  src={getCharacterImageUrl(character.avatar)}
                  title="Current avatar"
                  id="character-avatar-form"
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
          onChange={handleImageChange}
          />
            <div className="character-form-top-right">
              <div className="character-form-bottom">
              <label htmlFor="characterName"><b>Name:</b></label>
              <textarea
                id="name-field"
                className="character-field"
                value={characterName}
                type="text"
                onChange={(event) => setCharacterName(event.target.value)}
                required
              />
              <b>CharID:</b> 
              <p id="name-field">{character.char_id}</p>
            </div>
              <label htmlFor="characterPersonality"><b>Summary:</b></label>
              <textarea
                id="small-field"
                className="character-field"
                value={characterPersonality}
                name="characterPersonality"
                type="text"
                onChange={(event) => setcharacterPersonality(event.target.value)}
              />
              <label htmlFor="characterScenario"><b>Scenario:</b></label>
              <textarea
                id="small-field"
                className="character-field"
                name="characterScenario"
                value={characterScenario}
                type="text"
                onChange={(event) => setCharacterScenario(event.target.value)}
              />
            </div>
            <div className="character-form-top-right">
              <label htmlFor="characterGreeting"><b>Greeting:</b></label>
              <textarea
                id="large-field"
                className="character-field"
                name="characterGreeting"
                value={characterGreeting}
                type="text"
                onChange={(event) => setCharacterGreeting(event.target.value)}
              />
            </div>
          </div>
          <div className="character-form-bottom">
            <div className="character-form-bottom-box" id='description'>
              <label htmlFor="characterDescription"><b>Description:</b></label>
              <textarea
                id="large-field"
                className="character-field"
                name="characterDescription"
                value={characterDescription}
                type="text"
                onChange={(event) => setCharacterDescription(event.target.value)}
              />
            </div>
            <div className="character-form-bottom-box" id='examples'>
              <label htmlFor="characterExamples"><b>Dialogue Examples:</b></label>
              <textarea
                id="large-field"
                className="character-field"
                name="characterExamples"
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
            <button className="character-button" id="character-download" alt="Download Character" onClick={handleDownload}>
              <FiDownload className="react-icon"/>
            </button>
          </div>
      </form>
    </div>
  </div>
  );
};

export default UpdateCharacterForm;