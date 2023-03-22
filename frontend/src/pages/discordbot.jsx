import React from 'react';
import "../assets/css/settings.css";

const DiscordBot = () => {
  return (
    <div className='settings-panel'>
      <h1>Discord Bot Configuration</h1>
      <div className="settings-box" id='on-switch'>
        <h2>On/Off Switch</h2>
      </div>
    </div>
  );
};
  
export default DiscordBot;