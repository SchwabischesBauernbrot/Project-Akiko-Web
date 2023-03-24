import React, { useEffect, useState } from 'react';
import "../assets/css/settings.css";
import EndpointSelector from '../assets/components/EndpointSelector'

function Settings() {
  return (
    <>
      <h1 className='settings-panel-header'>Settings</h1>
      <div className='settings-panel'>
          <EndpointSelector/>
      </div>
    </>
  );
}

export default Settings;
