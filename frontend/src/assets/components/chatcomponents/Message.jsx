import React, {useRef, useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import { FiArrowDown, FiArrowUp, FiCheck, FiEdit, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { AiOutlineEye } from "react-icons/ai";
import TextareaAutosize from 'react-textarea-autosize';
import { convertUnixTimestampToDateTime } from '../miscfunctions';

function Message({ message, index, editedMessageIndex, handleEditMessage, handleTextEdit, handleMessageKeyDown, handleMoveUp, handleMoveDown, delMessage, handleReneration, handleOpenCharacterProfile, selectedCharacter, messages, handleOpenUserProfile, branchingEnabled, isSeen }) {
  const editedMessageRef = useRef(null);
  const isTyping = message.text.includes("is typing");

  return (
    <div key={index} className={`inline-flex text-left text-selected-text-color ${message.isIncoming ? "incoming-message" : "outgoing-message"} pop-in`}>
      <div className={`${message.isIncoming ? "avatar incoming-avatar" : "avatar outgoing-avatar"} h-12 w-12 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-4`}>
        <img src={message.avatar} onClick={message.sender === selectedCharacter.name ? handleOpenUserProfile : handleOpenCharacterProfile} alt={`${message.sender}'s avatar`} className="h-full w-full object-cover cursor-pointer" />
      </div>
      <div className="message-info flex flex-col">
        <div className="message-buttons absolute right-4 mt-4 flex flex-row">
          <button className="message-button" id={'edit'} onClick={(event) => handleEditMessage(event, index)} title={'Edit Message'}>{editedMessageIndex === index ? <FiCheck/> : <FiEdit/>}</button>
          {branchingEnabled &&
          <>
          <button className="message-button" id={'move-up'} onClick={() => handleMoveUp(index)} title={'Move Message Up One'}><FiArrowUp/></button>
          <button className="message-button" id={'move-down'} onClick={() => handleMoveDown(index)} title={'Move Message Down One'}><FiArrowDown/></button>
          </>}
          <button className="message-button" id={'delete-message'} onClick={() => delMessage(index)} title={'Remove Message from Conversation'}><FiTrash2/></button>
          {index === Math.ceil(messages.length - 1) && message.sender !== selectedCharacter.name && (
            <button className="message-button" id={'regenerate'} onClick={() => handleReneration()} title={'Regenerate Message'}><FiRefreshCw/></button>
          )}
        </div>
        <p className="sender-name m-0 inline-flex items-end font-bold mt-4">{message.sender}<p className='opacity-50 ml-1'>{convertUnixTimestampToDateTime(message.timestamp)}</p>{isSeen && <AiOutlineEye className="mb-1 ml-1 opacity-50"/>}</p>
        {editedMessageIndex === index ? (
          <div className="flex items-center flex-wrap w-full">
            <TextareaAutosize
              className="m-0 bg-transparent text-selected-text-color font-sans text-base h-auto py-1 rounded-lg border-2 border-gray-500 box-border resize-none overflow-y-auto w-[42.5rem] min-w-full"
              style={{ textShadow: '2px 2px 2px rgba(0, 0, 0, 0.411)' }}
              onBlur={(e) => handleTextEdit(index, e.target.value)}
              onKeyDown={(e) => handleMessageKeyDown(e)}
              ref={editedMessageRef}
              defaultValue={message.text}
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
              <ReactMarkdown 
              className='message-text m-0 font-sans text-base h-auto py-1 box-border resize-none overflow-y-auto min-w-full'
              components={{
                em: ({ node, ...props }) => <i style={{ color: "var(--selected-italic-color)" }} {...props} />,
              }}
              >{message.text}</ReactMarkdown>
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
