import React, { useEffect, useState } from 'react';
import { saveUserAvatar, getUserImageUrl } from '../api';
import { FiImage, FiSave } from 'react-icons/fi';

const UserInfo = ({onClose}) => {
    const [userImage, setUserImage] = useState(null);
    const [userName, setUserName] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [authorsNote, setAuthorsNote] = useState('');

    useEffect(() => {
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
      

    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            setUserImage(file);
            setImageUrl(URL.createObjectURL(file));
        }
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        const avatar = await saveUserAvatar(userImage);
        const newUserInfo = {
            avatar : avatar,
            name : userName,
            authorsNote : authorsNote
        }
        localStorage.setItem('configuredAvatar', avatar);
        localStorage.setItem('configuredName', userName);
        onClose(newUserInfo);
    }

    return (
        <div className="modal-overlay">
            <div className="character-info-box relative rounded-lg bg-selected-bb-color shadow-md backdrop-blur-10 focus-within:opacity-100 focus-within:button-container:flex justify-center">
            <span className="absolute top-0 right-0 p-4 text-xl font-bold cursor-pointer" onClick={onClose}>&times;</span>
            <div className="flex flex-col w-full max-w-md p-4 bg-selected-color rounded-lg">
                <h2 className="mb-4 text-xl font-bold">User Details</h2>
                <div className="flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="flex">
                    <div className="flex flex-col items-center w-1/2">
                        <label htmlFor="avatar-field" className="relative">
                        {!imageUrl && <FiImage className="w-24 h-24 text-gray-300"/>}
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
                            id="name-field"
                            className="character-field w-full px-2 py-1 mb-2 border rounded"
                            value={userName}
                            type="text"
                            onChange={(event) => setUserName(event.target.value)}
                            required
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
                    <div className="flex justify-end">
                    <button type="submit" className="p-2 text-white bg-blue-500 rounded">
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