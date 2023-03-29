import React, { useEffect, useState } from 'react';
import "../assets/css/settings.css";
import EndpointSelector from '../assets/components/settingscomponents/EndpointSelector'
import AvailableModules from '../assets/components/settingscomponents/AvailableModules'
import { fetchSettings } from '../assets/components/api';
import GroupChatSettings from '../assets/components/settingscomponents/GroupChatSettings';

function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const settings = await fetchSettings();
      if(settings === null) {
        if(localStorage.getItem('settings') === null) {
        return;
        } else {
          setSettings(JSON.parse(localStorage.getItem('settings')));
        }
      }else {
        setSettings(settings);
        localStorage.setItem('settings', JSON.stringify(settings));
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <h1 className='settings-panel-header'>Settings</h1>
      <div className='settings-panel'>
          <EndpointSelector/>
          <AvailableModules/>
          <GroupChatSettings settings={settings}/>
      </div>
    </>
  );
}

export default Settings;