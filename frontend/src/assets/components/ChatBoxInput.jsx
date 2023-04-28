import React, { useState, useEffect, useRef } from "react";
import { FiSliders, FiImage } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { BsPersonCheck, BsPersonCheckFill } from "react-icons/bs";
import GenSettingsMenu from "./GenSettingsMenu";
import UserInfo from "./chatcomponents/UserInfo";

function ChatboxInput({ onSend, impersonate, userEdit }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [messageImage, setMessageImage] = useState(null);
  const [text, setText] = useState("");
  const textAreaRef = useRef(null);
  const [GenSettingsMenuIsOpen, setGenSettingsMenuIsOpen] = useState(false);
  const [imageCaptioning, setImageCaptioning] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  
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
    setIsImpersonating(false);
  };

  const handleImpersonateClick = () => {
    setIsImpersonating(!isImpersonating);
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

  const handleUserMenuClose = async (user) => {
    if(user !== null){
      userEdit(user);
      setUserMenuOpen(false);
    }else{
      setUserMenuOpen(false);
    }
  };
  
  return (
    <>
    {userMenuOpen && (
      <UserInfo onClose={() => setUserMenuOpen(false)} handleSave={handleUserMenuClose}/>
    )}
    {GenSettingsMenuIsOpen && (
      <GenSettingsMenu onClose={() => setGenSettingsMenuIsOpen(false)}/>
    )}
    <div className="input-box relative overflow-x-auto max-w-[750px] flex flex-col justify-start p-2 selected-bb-color rounded-b-lg px-1 mt-1 h-18 send-input-container border-1 border-solid border-gray-500">
      <div className="send-input flex justify-between items-center">
        <div id="FiMenu" onClick={() => setUserMenuOpen(true)} title={'Change User Profile Settings'}>
          <CgProfile />
        </div>
        <div id="FiSliders" onClick={() => setGenSettingsMenuIsOpen(true)} title={'Change Generation Settings'}>
          <FiSliders />
        </div>
        <div id="FiImage" onClick={() => handleImpersonateClick()} title={'Impersonate Selected Character'}>
          {isImpersonating ? <BsPersonCheckFill/> : <BsPersonCheck/>}
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
          ref={textAreaRef}
          className="min-h-[1rem] bg-transparent backdrop-blur border-none outline-none text-selected-text-color flex-grow ml-2 h-auto overflow-y-scroll resize-none noto-sans-font "
        />
        <div onClick={handleSendClick} id="FiSend" title={'Send message'}>
          <HiOutlinePaperAirplane />
        </div>
      </div>
    </div>
    </>
  );
}

export default ChatboxInput;
