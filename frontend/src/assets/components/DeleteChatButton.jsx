import React, {useEffect, useState} from 'react';
import { deleteConversation } from './api';

const DeleteChatButton = ({ onDelete }) => {
  const [showDeleteConversationModal, setShowDeleteConversationModal] = useState(false);
  const [conversationName, setConversationName] = useState(null)

  useEffect(() => { 
    const convoName = localStorage.getItem('convoName');
    if(convoName !== null){
      setConversationName(convoName);
    }
  }, []);
  
  const handleClick = async () => {
    setShowDeleteConversationModal(true)
  };

  const handleDeleteConversation = async () => {
    try {
      await deleteConversation(conversationName);
      onDelete();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
    setShowDeleteConversationModal(false);
  }

  return (
    <>
    <button className='chat-delete' onClick={handleClick}>Delete Selected Chat</button>
    {showDeleteConversationModal && (
      <div className="modal-overlay">
        <div className="relative flex flex-col items-center justify-center p-10 bg-selected text-selected-text rounded shadow-lg">
          <h2 className="centered">Delete Conversation</h2>
          <p className="centered">Are you sure you want to delete this conversation?</p>
          <button className="text-selected-text bg-selected w-1/3 h-full p-2 rounded-lg shadow-md backdrop-blur-md border-none outline-none justify-center cursor-pointer hover:bg-blue-600" onClick={() => setShowDeleteConversationModal(false)}>Cancel</button>
          <button className="text-selected-text bg-selected w-1/3 h-full p-2 rounded-lg shadow-md backdrop-blur-md border-none outline-none justify-center cursor-pointer hover:bg-red-600" onClick={() => handleDeleteConversation()}>Delete</button>
        </div>
      </div>
    )}
    </>
  );
};

export default DeleteChatButton;
