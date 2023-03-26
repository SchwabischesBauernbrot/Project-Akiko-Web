import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import '../css/backgroundselector.css';

const { Option } = components;

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    backdropFilter: 'blur(10px)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    scrollbehavior: 'smooth',
    padding: 'none'
  }),
};

const Menu = ({ innerProps, children }) => {
  return (
    <div
      {...innerProps}
      style={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        position: 'absolute',
        zIndex: 1,
        scrollbehavior: 'smooth'
      }}
    >
      {children}
    </div>
  );
};

const BackgroundSelect = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch('/api/design/background')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Fetch failed; network response: ${response}`);
      })
      .then(data => {
        const newOptions = data.backgrounds.map(file => {
          const filename = file.split('.').slice(0, -1).join('.');
          return {
            value: filename,
            label: filename,
            imagePath: `/api/design/background/${file}`
          }
        });
        setOptions(newOptions);
      })
      .catch(error => {
        console.error('There was a problem fetching the background options:', error);
      });
  }, []);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    document.documentElement.style.setProperty('--bg-image', `url(${selectedOption.imagePath})`);
  };

  const CustomOption = (props) => (
    <Option {...props}>
      <img src={props.data.imagePath} style={{ width: '32px' }} />
    </Option>
  );

  return (
    <div id='bgdropdown'>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isSearchable={false}
        placeholder='Background'
        components={{ Option: CustomOption, Menu }}
        styles={customStyles}
      />
    </div>
  );
};

export default BackgroundSelect;
