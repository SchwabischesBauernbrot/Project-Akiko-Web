import React, { useState } from 'react';
import { FiUsers, FiSliders, FiImage } from 'react-icons/fi';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import Modal from './menucomponents/Modal'

const ChatboxInput = ({ onSend }) => {
  const [text, setText] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [messageImage, setMessageImage] = useState(null)
  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSendClick = () => {
    onSend(text, messageImage);
    setText('');
    setMessageImage(null);
  };

  const handleImageUpload = async (file) => {
    setMessageImage(file);
  }
  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Modal handleClose={() => setIsOpen(false)} isOpen={isOpen} />
    <div className='input-box'>
      <div className="send-input">
        <div id='FiMenu' onClick={() => setIsOpen(true)}>
          <FiUsers />
        </div>
        <div id='FiSliders' onClick={() => setIsOpen(true)}>
          <FiSliders/>
        </div>
        <label htmlFor='image-upload'>
          <FiImage id='FiImage'/>
        </label>
        <input id="image-upload" title="Upload Image" type="file" accept="image/" onChange={(e) => handleImageUpload(e.target.files[0])} style={{ display: 'none' }}/>
        <input
          type="text"
          id='input' 
          autoComplete='off'
          value={text}
          placeholder="Type your message..."
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendClick();
            }
          }}
        />
        <div onClick={handleSendClick} id='FiSend'><HiOutlinePaperAirplane/></div>
      </div>
    </div>
    </div>
  );
}

export default ChatboxInput;