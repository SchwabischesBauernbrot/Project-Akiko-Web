import React, { useEffect, useState } from 'react';
import EndpointSelector from '../assets/components/settingscomponents/EndpointSelector'
import AvailableModules from '../assets/components/settingscomponents/AvailableModules'
import { fetchSettings } from '../assets/components/api';
import GroupChatSettings from '../assets/components/settingscomponents/GroupChatSettings';
import ColorPicker from '../assets/components/menucomponents/ColorPickers';

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
      <h1 className='settings-panel-header text-xl font-bold'>Settings</h1>
      <div className='settings-panel'>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-28">
          <div id='endpoint'>
            <EndpointSelector/>
          </div>
          <div>
            <AvailableModules/>
          </div>
          <div>
            <ColorPicker/>
          </div>
          <div>
            <GroupChatSettings settings={settings}/>
          </div>
        </div>
      </div>
    </>
  );
  
}

export default Settings;