export const endpointSelect = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px solid white',
      backgroundColor: state.isFocused ? 'rgba(6, 136, 168, 0.5)' : 'transparent',
      color: 'white',
    }),
    control: () => ({
      display: 'flex',
      alignItems: 'center',
      borderRadius: '10px',
      backgroundColor: 'rgba(11, 11, 11, 0.636)',
      padding: '10px',
      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      cursor: 'pointer',
      color: 'white'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(11, 11, 11, 0.636)',
      backdropFilter: 'blur(10px)',
      color: 'white'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'white'
    }),
    container: (provided) => ({
      ...provided,
      color: 'white'
    })
  };

export const chatSelect = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px solid white',
      backgroundColor: state.isFocused ? 'rgba(6, 136, 168, 0.5)' : 'transparent',
      color: 'white'
    }),
    control: () => ({
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '10px',
      backgroundColor: 'rgba(11, 11, 11, 0.636)',
      padding: '10px',
      boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(10px)',
      cursor: 'pointer'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(11, 11, 11, 0.636)',
      backdropFilter: 'blur(10px)'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'white'
    }),
    container: (provided) => ({
      ...provided,
      color: 'white',
      height: 'auto'
    })
  };