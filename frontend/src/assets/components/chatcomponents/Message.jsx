import React, {useRef, useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import { FiArrowDown, FiArrowUp, FiCheck, FiEdit, FiRefreshCw, FiTrash2 } from "react-icons/fi";

function Message({ message, index, editedMessageIndex, handleEditMessage, handleTextEdit, handleMessageKeyDown, handleMoveUp, handleMoveDown, delMessage, handleReneration, handleOpenCharacterProfile, selectedCharacter, messages }) {
  const editedMessageRef = useRef(null);
  const [editRowCounter, setEditRowCounter] = useState(1);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, [index]);
  
  const isTyping = message.text.includes("is typing");

  return (
    <div key={index} className={`${message.isIncoming ? "incoming-message" : "outgoing-message"} ${show ? 'pop-in' : ''}`}>
      <div className={message.isIncoming ? "avatar incoming-avatar" : "avatar outgoing-avatar"}>
        <img src={message.avatar} onClick={message.sender === selectedCharacter.name ? handleOpenCharacterProfile : undefined}alt={`${message.sender}'s avatar`} />
      </div>
      <div className="message-info">
        <div className="message-buttons">
          <button className="message-button" id={'edit'} onClick={(event) => handleEditMessage(event, index)} title={'Edit Message'}>{editedMessageIndex === index ? <FiCheck/> : <FiEdit/>}</button>
          <button className="message-button" id={'move-up'} onClick={() => handleMoveUp(index)} title={'Move Message Up One'}><FiArrowUp/></button>
          <button className="message-button" id={'move-down'} onClick={() => handleMoveDown(index)} title={'Move Message Down One'}><FiArrowDown/></button>
          <button className="message-button" id={'delete-message'} onClick={() => delMessage(index)} title={'Remove Message from Conversation'}><FiTrash2/></button>
          {index === Math.ceil(messages.length - 1) && message.sender !== selectedCharacter.name && (
            <button className="message-button" id={'regenerate'} onClick={() => handleReneration()} title={'Regenerate Message'}><FiRefreshCw/></button>
          )}
        </div>
        <p className="sender-name">{message.sender}</p>
        {editedMessageIndex === index ? (
          <div className="message-editor">
            <textarea
              rows={editRowCounter > 1 ? editRowCounter : Math.ceil(message.text.length / 75)}
              id="message-edit"
              contentEditable
              suppressContentEditableWarning={true}
              onBlur={(e) => handleTextEdit(index, e.target.value)}
              onKeyDown={(e) => handleMessageKeyDown(e)}
              ref={editedMessageRef}
              defaultValue={message.text}
              onInput={(e) => { setEditRowCounter(e.target.value.length/75) }}
            />
          </div>
        ) : (
          <div onDoubleClick={(event) => handleEditMessage(event, index)}>
            {isTyping ? (
              <>
                <div className="loading">
                  <div className="loading__letter">  .</div>
                  <div className="loading__letter">.</div>
                  <div className="loading__letter">.</div>
                </div>
              </>
            ) : (
              <ReactMarkdown className="message-text" components={{em: ({node, ...props}) => <i style={{color: 'rgb(211, 211, 211)'}} {...props} />}}>{message.text}</ReactMarkdown>
            )}
          </div>
        )}
        {message.image && (
          <img className="sent-image" src={message.image} alt="User image"/>
        )}
      </div>
    </div>
  );
}

export default Message;
