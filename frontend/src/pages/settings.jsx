import React, { useEffect, useState } from 'react';
import "../assets/css/settings.css";
import EndpointSelector from '../assets/components/EndpointSelector'

function Settings() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    var localOption = localStorage.getItem('endpointType');
    if (localOption != null){
      setSelectedOption(localOption);
      setInputValue(localStorage.getItem('endpoint'));
    }
  }, []);

  return (
    <div>
      <div className="endpoint-select">
        <EndpointSelector
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
        {/* The rest of the elements */}
      </div>
    </div>
  );
}

export default Settings;
