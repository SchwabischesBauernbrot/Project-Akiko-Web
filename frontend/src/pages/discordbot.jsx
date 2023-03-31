import React, { useState, useEffect, useRef } from 'react';
import "../assets/css/discordbot.css";
import { RxDiscordLogo } from 'react-icons/rx';

const DiscordBot = () => {
  // Define a state variable called `isOn`, and initialize it to `false`.
  const [isOn, setIsOn] = useState(false);

  // Define a function called `handleToggle` that toggles the value of `isOn`.
  const handleToggle = () => {
    setIsOn(!isOn);
  }

  // Use a ref to store a reference to the settings panel container element
  const settingsPanelRef = useRef(null);

  // Use effect to calculate the height of the tallest settings box and set the height of all boxes to that value
  useEffect(() => {
    const settingsBoxes = document.querySelectorAll('.settings-box');
    const settingsBoxHeights = Array.from(settingsBoxes).map(box => box.getBoundingClientRect().height);
    const tallestBoxHeight = Math.max(...settingsBoxHeights);
    settingsBoxes.forEach(box => box.style.height = `${tallestBoxHeight}px`);
  }, []);

  // Render a JSX element that displays the header and the toggle button.
  return (
    <>
      <h1 className='settings-panel-header'>Discord Bot Configuration</h1>
      <div className='settings-panel' ref={settingsPanelRef}>
        <div className="settings-box" id='on-switch'>
          <RxDiscordLogo className="discord-logo" />
          <h2>On/Off Switch</h2>
          {/* Display a button, and set its text and color based on the value of `isOn`. */}
          <button className={`discord-button ${isOn ? 'discord-button-on' : ''}`} onClick={handleToggle}>
            {isOn ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="settings-box" id='on-switch'></div>
        <div className="settings-box" id='on-switch'></div>
      </div>
    </>
  );
};

export default DiscordBot;
