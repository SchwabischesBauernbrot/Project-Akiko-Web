import React, { useEffect, useState } from 'react';
import { saveUserAvatar, getUserImageUrl, fetchUserAvatars } from '../api';
import { FiImage, FiSave } from 'react-icons/fi';
import { RxReset } from 'react-icons/rx';
import Select from 'react-select';

const UserInfo = ({onClose, handleSave}) => {
    const [userImage, setUserImage] = useState(null);
    const [userName, setUserName] = useState('You');
    const [imageUrl, setImageUrl] = useState(null);
    const [authorsNote, setAuthorsNote] = useState('');
    const [availableAvatars, setAvailableAvatars] = useState([]);

    useEffect(() => {
        const fetchAvatars = async () => {
            const avatars = await fetchUserAvatars();
            setAvailableAvatars(avatars);
        };
        fetchAvatars();
        if(localStorage.getItem('configuredName')){
          setUserName(localStorage.getItem('configuredName'));
        }else{
          setUserName('You');
        }
        if(localStorage.getItem('configuredAvatar')){
          const userAvatar = localStorage.getItem('configuredAvatar');
          setUserImage(userAvatar);
          if (userAvatar.startsWith('http') || userAvatar.startsWith('/')) {
            setImageUrl(userAvatar);
          } else {
            setImageUrl(getUserImageUrl(userAvatar));
          }
        }
      }, []);
    
    useEffect(() => {
        if (userImage !== null) { // Add this condition
            if (typeof userImage === 'string') { // If userImage is a filename (selected avatar)
                setImageUrl(getUserImageUrl(userImage));
            } else if (typeof userImage === 'object') { // If userImage is a File object (uploaded image)
                setImageUrl(URL.createObjectURL(userImage));
            }
        } else {
            setImageUrl(null); // Reset imageUrl if userImage is null
        }
    }, [userImage]);
    
    

    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            setUserImage(file);
            setImageUrl(URL.createObjectURL(file));
        }
    }

    const options = availableAvatars.map((avatar) => ({
        value: avatar,
        label: avatar,
        avatar: getUserImageUrl(avatar),
    }));
    
    const formatOptionLabel = ({ label, avatar }) => (
        <div className='flex items-center space-x-2'>
            <img className='rounded-full object-cover w-8 h-8' src={avatar} title={label} alt='avatar'/>
        </div>
    );
    

    function handleAvatarSelect(option) {
        const selectedAvatar = option.value;
        setUserImage(selectedAvatar);
    }

    const customStyles = {
        menu: (provided) => ({
            ...provided,
            width: 'fit-content',
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
        }),
        control: (provided) => ({
            ...provided,
            width: 'fit-content',
            backgroundColor: 'rgba(18, 18, 18, 0.737)',
            boxShadow: '0px 0px 10px 0px rgba(57, 57, 57, 0.737)',
            backdropFilter: 'blur(11px)',
            scrollbehavior: 'smooth',
            color: 'black',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(11, 11, 11, 0.636)',
            color: 'white',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: 'gray'
        }),
    };

    async function handleSubmit(event) {
        event.preventDefault();
        let avatar;
        
        if (typeof userImage === 'object') { // Check if userImage is a File object (uploaded image)
            avatar = await saveUserAvatar(userImage); // Save the uploaded image
        } else {
            avatar = userImage; // Use the selected avatar's filename
        }
    
        localStorage.setItem('configuredAvatar', avatar);
        localStorage.setItem('configuredName', userName);
        const newUserInfo = {
            avatar: avatar,
            name: userName,
            authorsNote: authorsNote
        }
        handleSave(newUserInfo);
    }
    
    const handleDefault = () => {
        setUserImage(null);
        setUserName('You');
        setImageUrl(getUserImageUrl('default.png'));
        localStorage.setItem('configuredAvatar', 'default.png');
        localStorage.setItem('configuredName', 'You');
        onClose(null);
    }
    return (
        <div className="modal-overlay">
            <div className="relative bg-selected text-selected-text rounded shadow-lg backdrop-blur-10 focus-within:opacity-100 focus-within:button-container:flex justify-center">
            <span className="absolute top-0 right-0 p-4 text-xl font-bold cursor-pointer hover:text-red-600" onClick={onClose}>&times;</span>
            <div className="flex flex-col w-full max-w-md p-4 bg-selected-color rounded-lg">
                <h1 className="text-xl font-bold mb-4 text-center mx-auto">User Details</h1>
                <div className="flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="flex">
                    <div className="flex flex-col items-center w-1/2">
                        <label htmlFor="avatar-field" className="relative">
                        {!imageUrl && <FiImage className="w-24 h-24 text-selected-text"/>}
                        {imageUrl && <img src={imageUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover"/>}
                        <input
                            id="avatar-field"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            type="file"
                            name="userAvatar"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        </label>
                    </div>
                        <div className="w-1/2">
                            <label htmlFor="userName" className="font-bold">Name:</label>
                            <textarea
                                id="userName" // Change the id attribute here
                                className="character-field w-full px-2 py-1 mb-2 border rounded"
                                value={userName}
                                type="text"
                                onChange={(event) => setUserName(event.target.value)}
                                required
                            />
                            <label htmlFor="avatarSelect" className="font-bold">
                                Available avatars:
                            </label>
                            <Select
                                styles={customStyles}
                                options={options}
                                formatOptionLabel={formatOptionLabel}
                                value={options.find((option) => option.value === userImage)}
                                onChange={handleAvatarSelect}
                                placeholder="Select an avatar"
                            />
                        </div>
                    </div>
                    <div className="w-full">
                            <label htmlFor="authorsNote" className="font-bold">Author's Note:</label>
                                <textarea
                                id="authors-note"
                                className="character-field w-full px-2 py-1 mb-2 border rounded"
                                value={authorsNote}
                                type="text"
                                onChange={(event) => setAuthorsNote(event.target.value)}
                                placeholder="Author's Note Here"
                                />
                        </div>
                    <div className="flex justify-center">
                    <button className="aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer transition-colors hover:bg-red-600 text-selected-text" onClick={() => handleDefault()}title='Reset to default'>
                        <RxReset className="react-icon"/>
                    </button>
                    <button className="aspect-w-1 aspect-h-1 rounded-lg shadow-md backdrop-blur-md p-2 w-16 border-none outline-none justify-center cursor-pointer transition-colors hover:bg-blue-600 text-selected-text" type="submit">
                        <FiSave className="react-icon"/>
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        </div>
    );
}
export default UserInfo;