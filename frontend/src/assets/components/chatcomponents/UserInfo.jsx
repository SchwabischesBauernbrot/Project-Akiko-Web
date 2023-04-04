import React, { useEffect, useState } from 'react';
import { getCharacterImageUrl, saveUserAvatar } from '../api';
import { FiImage, FiSave } from 'react-icons/fi';

const UserInfo = ({onClose}) => {
    const [userImage, setUserImage] = useState(null);
    const [userName, setUserName] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [authorsNote, setAuthorsNote] = useState('');

    useEffect(() => {
        if(localStorage.getItem('configuredName')){
            setUserName(localStorage.getItem('configuredName'));
        }else{
            setUserName('You');
        }
        if(localStorage.getItem('userImage')){
            setUserImage(localStorage.getItem('userImage')); // Fixed here
            let url = getCharacterImageUrl(localStorage.getItem('userImage')) // Fixed here
            setImageUrl(url);
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
        const newUserInfo = {
            userImage : userImage,
            userName : userName,
            authorsNote : authorsNote
        }
        await saveUserAvatar(newUserInfo);
        localStorage.setItem('userImage', userImage);
        localStorage.setItem('configuredName', userName);
        onClose();
    }

    return (
        <div className="modal-overlay">
            <div className="user-info-menu">
                <span className="close" onClick={onClose} style={{cursor: 'pointer'}}>&times;</span>
                <h2 id='charactername-title'>User Details</h2>
                <div className="user-info-wrapper">
                    <form onSubmit={handleSubmit}>
                    <div className="user-info-top">
                        <div className="user-info-top-left">
                            <label htmlFor="avatar-field">{!imageUrl && <FiImage id="avatar-default"/>} {imageUrl && <img src={imageUrl} alt="avatar" id="character-avatar-form"/>}</label>
                            <input
                            id="avatar-field"
                            type="file"
                            name="userAvatar"
                            accept="image/*"
                            onChange={handleImageChange}
                            />
                        </div>
                        <div className="user-info-top-right">
                            <label htmlFor="userName"><b>Name:</b></label>
                            <textarea
                                id="name-field"
                                className="character-field"
                                value={userName}
                                type="text"
                                onChange={(event) => setUserName(event.target.value)}
                                required
                            />
                            <label htmlFor="authorsNote"><b>Author's Note:</b></label>
                            <textarea
                                id="authors-note"
                                className='character-field'
                                value={authorsNote}
                                type="text"
                                onChange={(event) => setAuthorsNote(event.target.value)}
                                placeholder="Author's Note Here"
                            />
                        </div>
                    </div>
                    <div className="user-info-bottom">
                        <div className="user-info-bottom-left">
                        </div>
                        <div className="user-info-bottom-right">
                            <div className="form-bottom-buttons">
                                <button type="submit" id='submit' className="icon-button"><FiSave className="react-icon"/></button>
                            </div>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default UserInfo;