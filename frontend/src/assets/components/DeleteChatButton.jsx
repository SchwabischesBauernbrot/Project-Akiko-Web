import React, {useState} from 'react';
import { deleteConversation } from './api';

const DeleteChatButton = ({ conversationName, onDelete }) => {
  const [showDeleteConversationModal, setShowDeleteConversationModal] = useState(false);

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
        <div className="modal-small-box">
          <h2 className="centered">Delete Conversation</h2>
          <p className="centered">Are you sure you want to delete this conversation?</p>
          <button className="submit-button" onClick={() => setShowDeleteConversationModal(false)}>Cancel</button>
          <button className="cancel-button" onClick={() => handleDeleteConversation()}>Delete</button>
        </div>
      </div>
    )}
    </>
  );
};

export default DeleteChatButton;
