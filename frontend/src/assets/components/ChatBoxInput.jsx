import React, { useState, useEffect, useRef } from "react";
import { FiUsers, FiSliders, FiImage } from "react-icons/fi";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import GenSettingsMenu from "./GenSettingsMenu";

function ChatboxInput({ onSend }) {
  const [messageImage, setMessageImage] = useState(null);
  const [text, setText] = useState("");
  const textAreaRef = useRef(null);
  const [GenSettingsMenuIsOpen, setGenSettingsMenuIsOpen] = useState(false);

  useEffect(() => {
    if (textAreaRef.current) {
      // Auto-scroll to the bottom of the textarea
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  });

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSendClick = () => {
    onSend(text, messageImage);
    setText("");
    setMessageImage(null);
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
        <div id="FiMenu" onClick={() => setIsOpen(true)}>
          <FiUsers />
        </div>
        <div id="FiSliders" onClick={() => setGenSettingsMenuIsOpen(true)}>
          <FiSliders />
        </div>
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
        <textarea
          id="input"
          autoComplete="off"
          value={text}
          placeholder="Type your message..."
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          ref={textAreaRef}/>
        <div onClick={handleSendClick} id="FiSend">
          <HiOutlinePaperAirplane />
        </div>
      </div>
    </div>
    </>
  );
}

export default ChatboxInput;
