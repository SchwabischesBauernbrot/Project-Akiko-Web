import React, { useEffect, useState } from 'react';
import "../assets/css/settings.css";
import EndpointSelector from '../assets/components/EndpointSelector'

function Settings() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    var localOption = localStorage.getItem('endpointType');
    if (localOption != null){
      setSelectedOption({value: localOption, label: localOption});
      setInputValue(localStorage.getItem('endpoint'));
    }
  }, []);

  return (
    <>
      <h1 className='settings-panel-header'>Settings</h1>
      <div className='settings-panel'>
        <div className="settings-box" id='endpoint'>
          <h2>Endpoint Selection</h2>
          <div id='endpoint-container'>
          <EndpointSelector
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
