import React, { useEffect, useState } from 'react';
import "../assets/css/settings.css";
import EndpointSelector from '../assets/components/settingscomonents/EndpointSelector'
import AvailableModules from '../assets/components/settingscomonents/AvailableModules'

function Settings() {
  return (
    <>
      <h1 className='settings-panel-header'>Settings</h1>
      <div className='settings-panel'>
          <EndpointSelector/>
          <AvailableModules/>
      </div>
    </>
  );
}

export default Settings;