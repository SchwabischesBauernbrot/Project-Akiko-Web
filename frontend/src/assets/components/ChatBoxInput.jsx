import React, { useState } from 'react';
import { FiUsers, FiSliders } from 'react-icons/fi';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import AvatarChatPreview from './menucomponents/AvatarChatPreview';
import Modal from './menucomponents/Modal'


const ChatboxInput = ({ onSend }) => {
  const [text, setText] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSendClick = () => {
    onSend('You', text);
    setText('');
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Modal handleClose={() => setIsOpen(false)} isOpen={isOpen}>
      This is Modal Content!
    </Modal>
    <div className='inputBox'>
      <div className="send-input">
        <div id='FiMenu' onClick={() => setIsOpen(true)}>
          <FiUsers />
        </div>
        <div id='FiSliders'><FiSliders/></div>
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
        <div onClick={handleSendClick} id='send'><HiOutlinePaperAirplane/></div>
      </div>
    </div>
    </div>
  );
}

export default ChatboxInput;
