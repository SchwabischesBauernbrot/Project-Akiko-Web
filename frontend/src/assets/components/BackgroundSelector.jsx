import React, { useState } from 'react';
import Select, { components } from 'react-select';
import { FiChevronDown } from 'react-icons/fi';
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


const CustomOption = (props) => (
  <Option {...props}>
    {props.data.icon} {props.data.label}
  </Option>
);

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

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const options = [
    {
      icon: <img src="https://i.imgur.com/jf9w6NO.png"/>,
    },
    {
      icon: <img src="https://cdnb.artstation.com/p/assets/images/images/009/356/463/large/natthamon-asawakowitkorn-.jpg?1518517487"/>,
    },
    {
      icon: <img src="https://cdnb.artstation.com/p/assets/images/images/014/943/389/large/julian-seifert-tavern-ful.jpg?1546427640"/>,
    },
  ];

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

