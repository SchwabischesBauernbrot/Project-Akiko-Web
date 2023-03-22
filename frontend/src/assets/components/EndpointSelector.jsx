import React, { useState } from 'react';
import Select from 'react-select';
import { endpointSelect } from './selectStyles.js';

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

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
      };
    
    const getDefaultInputValue = (option) => {
        switch (option) {
          case 'Kobold':
            return 'https://localhost:5000/';
          case 'OobaTextUI':
            return 'https://localhost:7861/';
          case 'AkikoBackend':
            return 'https://localhost:5100/' ;
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
        styles={endpointSelect}
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
  