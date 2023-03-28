import React, { useState, useEffect, useRef } from "react";
import { FiUsers, FiSliders, FiImage } from "react-icons/fi";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { BsPersonCheck } from "react-icons/bs";
import GenSettingsMenu from "./GenSettingsMenu";

function ChatboxInput({ onSend, impersonate }) {
  const [messageImage, setMessageImage] = useState(null);
  const [text, setText] = useState("");
  const textAreaRef = useRef(null);
  const [GenSettingsMenuIsOpen, setGenSettingsMenuIsOpen] = useState(false);
  const [imageCaptioning, setImageCaptioning] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('imageCaptioning') !== null) {
      setImageCaptioning(localStorage.getItem('imageCaptioning') === 'true');
    }
    if (textAreaRef.current) {
      // Auto-scroll to the bottom of the textarea
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, []);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSendClick = () => {
    onSend(text, messageImage);
    setText("");
    setMessageImage(null);
  };

  const handleImpersonateClick = () => {
    impersonate();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  const handleImageUpload = async (file) => {
    setMessageImage(file);
  };

  return (
    <>
    {GenSettingsMenuIsOpen && (
      <GenSettingsMenu onClose={() => setGenSettingsMenuIsOpen(false)}/>
    )}
    <div className="input-box">
      <div className="send-input">
        <div id="FiMenu" onClick={() => setIsOpen(true)} title={'Change User Profile Settings'}>
          <FiUsers />
        </div>
        <div id="FiSliders" onClick={() => setGenSettingsMenuIsOpen(true)} title={'Change Generation Settings'}>
          <FiSliders />
        </div>
        <div id="FiImage" onClick={() => handleImpersonateClick()} title={'Impersonate Selected Character'}>
          <BsPersonCheck/>
        </div>
        {imageCaptioning == true && (
          <>
            <label htmlFor="image-upload">
              <FiImage id="FiImage" />
            </label>
            <input
            id="image-upload"
            title="Upload Image"
            type="file"
            accept="image/"
            onChange={(e) => handleImageUpload(e.target.files[0])}
            style={{ display: "none" }}
          />
          </>
        )}
        <textarea
          id="input"
          autoComplete="off"
          value={text}
          placeholder="Type your message..."
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          ref={textAreaRef}/>
        <div onClick={handleSendClick} id="FiSend" title={'Send message'}>
          <HiOutlinePaperAirplane />
        </div>
      </div>
    </div>
    </>
  );
}

export default ChatboxInput;
