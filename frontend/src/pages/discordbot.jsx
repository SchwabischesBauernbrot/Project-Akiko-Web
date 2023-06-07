import React, { useState, useEffect, useRef } from 'react';
import { RxDiscordLogo } from 'react-icons/rx';
import 'tailwindcss/tailwind.css';
import { getBotStatus, getDiscordSettings, startDisBot, stopDisBot } from '../assets/components/discordbot/dbotapi';


const DiscordBot = () => {
  const [botToken, setBotToken] = useState('');
  const [channels, setChannels] = useState('');
  const [channelList, setChannelList] = useState([]);
  const [isOn, setIsOn] = useState(false);

  const handleToggle = async () => {
    if (isOn) {
      await stopDisBot();
      setIsOn(false);
    } else {
      await startDisBot();
      setIsOn(true);
    }
  };


  const settingsPanelRef = useRef(null);

  useEffect(() => {
    const settingsBoxes = document.querySelectorAll('.settings-box');
    const settingsBoxHeights = Array.from(settingsBoxes).map(box => box.getBoundingClientRect().height);
    const tallestBoxHeight = Math.max(...settingsBoxHeights);
    settingsBoxes.forEach(box => (box.style.height = `${tallestBoxHeight}px`));
    const fetchData = async () => {
      const response = await getBotStatus();
      setIsOn(response);
      const data = await getDiscordSettings();
      setBotToken(data.data.token);
      setChannelList(data.data.channels);
    };
    fetchData();
  }, []);

  return (
    <>
      <h1 className='settings-panel-header text-xl font-bold'>Discord Bot Configuration</h1>
      <div className='settings-panel' ref={settingsPanelRef}>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          <div className="settings-box" id='on-switch'>
            <RxDiscordLogo className="discord-logo" />
            <h2>On/Off Switch</h2>
            <button className={`discord-button ${isOn ? 'discord-button-on' : ''}`} onClick={handleToggle}>
              {isOn ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="settings-box" id='bot-token'>
            <h2>Discord Bot Token</h2>
            <div className="input-group">
              <input type="text" value={botToken} onChange={(event) => setBotToken(event.target.value)} />
            </div>
          </div>
          <div className="settings-box" id='channel'>
            <h2>Visible Channels</h2>
            <div className="input-group">
              <input type="text" value={channels} onChange={(event) => setChannels(event.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscordBot;