import React from 'react';

const DeleteMessageModal = ({ isOpen, handleCancel, handleDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-small-box">
        <h2 className="centered">Delete Message</h2>
        <p className="centered">Are you sure you want to delete this message?</p>
        <button className="submit-button" onClick={handleCancel}>Cancel</button>
        <button className="cancel-button" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default DeleteMessageModal;
