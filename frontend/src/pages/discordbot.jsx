import React, { useState, useEffect, useRef } from 'react';
import { RxDiscordLogo } from 'react-icons/rx';
import { getBotStatus, getDiscordSettings, startDisBot, stopDisBot, saveDiscordConfig } from '../assets/components/discordbot/dbotapi';
import { FiSave } from 'react-icons/fi';


const DiscordBot = () => {
  const [botToken, setBotToken] = useState('');
  const [channelList, setChannelList] = useState([]);
  const [isOn, setIsOn] = useState(false);
  
  const channels = channelList.join(', ');

  const handleToggle = async () => {
    if (isOn) {
      await stopDisBot();
      setIsOn(false);
    } else {
      await startDisBot();
      setIsOn(true);
    }
  };

  const handleChannelsChange = (event) => {
    const newChannels = event.target.value.split(',').map(channel => channel.trim());
    setChannelList(newChannels);
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
  
  const saveData = async () => {
    let data = {
      "token" : botToken,
      "channels" : channelList
    }
    saveDiscordConfig(data);
  };

  return (
    <>
      <h1 className='settings-panel-header text-xl font-bold'>Discord Bot Configuration</h1>
      <div className='settings-panel' ref={settingsPanelRef}>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          <div className="settings-box" id='on-switch'>
            <RxDiscordLogo className="discord-logo" />
            <h2 className='text-selected-text font-bold'>On/Off Switch</h2>
            <button className={`discord-button ${isOn ? 'discord-button-on' : ''}`} onClick={handleToggle}>
              {isOn ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="settings-box" id='bot-token'>
            <h2 className='text-selected-text font-bold'>Discord Bot Token</h2>
            <div className="input-group">
              <input type="text" value={botToken} onChange={(event) => setBotToken(event.target.value)} />
            </div>
          </div>
          <div className="settings-box" id='channel'>
            <h2 className='text-selected-text font-bold'>Visible Channels</h2>
            <div className="input-group">
              <input type="text" value={channels} onChange={handleChannelsChange} />
            </div>
          </div>
        </div>
        <div className="items-center flex flex-col mt-4">
          <button className="aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-2 border-solid border-gray-500 outline-none justify-center cursor-pointer transition-colors hover:bg-blue-600 text-selected-text" onClick={(event) => saveData()}>
            <FiSave className="react-icon"/>
          </button>
        </div>
      </div>
    </>
  );
};

export default DiscordBot;