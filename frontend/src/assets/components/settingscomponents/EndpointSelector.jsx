import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Connect from '../Connect';
import HordeModelSelector from './HordeModelSelector';

const EndpointSelector = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
      var localOption = localStorage.getItem('endpointType');
      if (localOption != null){
        setSelectedOption({value: localOption, label: localOption});
        setInputValue(localStorage.getItem('endpoint'));
      }
    }, []);

    const handleOptionChange = (selectedOption) => {
      setSelectedOption(selectedOption);
      setInputValue(getDefaultInputValue(selectedOption.value));
    };
    
    const handleConnectClick = () => {
      if(selectedOption.value === 'Horde') {
        localStorage.setItem('endpoint', inputValue);
        localStorage.setItem('endpointType', selectedOption.value);
        setSelectedOption(localStorage.getItem('endpointType'), localStorage.getItem('endpoint'));
      } else {
        const url = ensureUrlFormat(inputValue)
        setInputValue(url);
        localStorage.setItem('endpointType', selectedOption.value);
        localStorage.setItem('endpoint', inputValue);
        setSelectedOption(localStorage.getItem('endpointType'), localStorage.getItem('endpoint'));
      }
      };

    function ensureUrlFormat(str) {
        let url;
        try {
          url = new URL(str);
        } catch (error) {
          // If the provided string is not a valid URL, create a new URL
          url = new URL(`http://${str}/`);
        }
      
        return url.href;
      }
    
    const getDefaultInputValue = (option) => {
        switch (option) {
          case 'Kobold':
            return 'http://localhost:5000/';
          case 'Ooba':
            return 'http://localhost:7861/';
          case 'AkikoBackend':
            return 'http://localhost:5100/' ;
          case 'Horde':
            return '0000000000';
          default:
            return '';
        }
      };
    
    const options = [
        { value: 'Kobold', label: 'Kobold' },
        { value: 'Ooba', label: 'OobaTextUI' },
        { value: 'AkikoBackend', label: 'AkikoTextgen' },
        { value: 'OAI', label: 'OpenAI (API-KEY)' },
        { value: 'Horde', label: 'Horde' }
    ];
  
    return (
        <div className="settings-box" id='endpoint'>
          <h2 className='settings-box'>Text Generation Endpoint</h2>
          <div id='endpoint-container'>
        <form onSubmit={handleConnectClick}>
        <Select
        id="options"
        options={options}
        value={selectedOption}
        onChange={handleOptionChange}
        placeholder={selectedOption}
        />
        {selectedOption && (
            <input
            id="inputValue"
            type="text"
            label="If using the Kobold or Ooba endpoint, enter the URL here. If using the OpenAI endpoint, enter your API key here. If using Horde, enter your API key or leave empty for anonymous mode."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={getDefaultInputValue(selectedOption.value)}
            />
        )}
        {selectedOption && (
            <button className="connect-button" type="submit">Connect</button>
        )}
        </form>
        <Connect/>
        </div>
        {selectedOption && selectedOption.value === 'Horde' && (
          <HordeModelSelector/>
          )}
        </div>
    );
  };
  
  export default EndpointSelector;
  