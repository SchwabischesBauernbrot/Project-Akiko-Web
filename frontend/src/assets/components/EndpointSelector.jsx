import React, { useState } from 'react';
import Select from 'react-select';

const EndpointSelector = ({ selectedOption, setSelectedOption, inputValue, setInputValue }) => {
    const handleOptionChange = (selectedOption) => {
      setSelectedOption(selectedOption);
      setInputValue(getDefaultInputValue(selectedOption.value));
    };
    
    const handleConnectClick = () => {
        localStorage.setItem('endpointType', selectedOption.value);
        localStorage.setItem('endpoint', inputValue);
        setSelectedOption(localStorage.getItem('endpointType', inputValue));
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
    
    const handleInputChange = (e) => {
        const url = ensureUrlFormat(e.target.value)
        setInputValue(url);
      };
    
    const getDefaultInputValue = (option) => {
        switch (option) {
          case 'Kobold':
            return 'http://localhost:5000/';
          case 'OobaTextUI':
            return 'http://localhost:7861/';
          case 'AkikoBackend':
            return 'http://localhost:5100/' ;
        }
      };
    
    const options = [
        { value: 'Kobold', label: 'Kobold' },
        { value: 'OobaTextUI', label: 'OobaTextUI' },
        { value: 'AkikoBackend', label: 'AkikoBackend' },
    ];
  
    return (
        <div>
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
            value={inputValue}
            onChange={handleInputChange}
            placeholder={getDefaultInputValue(selectedOption.value)}
            />
        )}
        {selectedOption && (
            <button className="connect-button" onClick={handleConnectClick}>Connect</button>
        )}
        </div>
    );
  };
  
  export default EndpointSelector;
  