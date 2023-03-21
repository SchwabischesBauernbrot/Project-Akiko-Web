import { useEffect } from "react";
import { FiX } from 'react-icons/fi'
import IncSlider from "./IncrementalSlider";
import "./modalStyles.css";

function Modal({ isOpen, handleClose }) {
  useEffect(() => {
    
    const closeOnEscapeKey = e => e.key === "Escape" ? handleClose() : null;
    const closeOnOutsideClick = e => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.body.addEventListener("keydown", closeOnEscapeKey);
    window.addEventListener("mousedown", closeOnOutsideClick);
  
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
      window.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);  

  if (!isOpen) return null;
  const defaultAvatar = 'https://cdn.discordapp.com/attachments/1070388301397250170/1072227534713921616/tmpu7e13o19.png'
  const botAvatar = 'https://i.imgur.com/LPSD78p.png'
  const botName = 'Mika'

  return (
    <div className="modal">
      <FiX onClick={handleClose} className="close-btn">
      </FiX>

      <div className="modal-content">
        <div id='messagepreview_container'>
        <div id='senderPreview'>
        <div id='senderName'>You</div>
          <img src={defaultAvatar} alt="avatar" className="avatar incoming-avatar" />
          <p id='incomingmessage_preview_placeholder'>This is what your messages will look like.</p>
      </div>

      <div id='AIPreview'>
        <div id='AIName'>{botName}</div>
          <img src={botAvatar} alt="avatar" className="avatar incoming-avatar" />
          <p id='outgoingmessage_preview_placeholder'>This is what {botName}'s messages will look like.</p>
      </div>
      </div>

      <div id='avatarchange'>
      <div className='hover_grey'><img id='senderAvatar_change' src={defaultAvatar} alt="avatar" className="avatar incoming-avatar" /></div>
      <div className="avatarchange_text">
        <h4 id='youname'>You</h4>
        </div>
      <div className='hover_grey'><img id='botAvatar_change' src={botAvatar} alt="avatar" className="avatar incoming-avatar" /></div>
      <div className="avatarchange_text">
        <h4 id='botname'>{botName}</h4>
      </div>
      </div>

      </div>
      </div>
  );
};

export default Modal;