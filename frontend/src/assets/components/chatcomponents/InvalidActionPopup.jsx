import React from 'react';

const InvalidActionPopup = ({ isOpen, handleInvalidAction }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-small-box">
        <h2>No Character Selected!</h2>
        <p>If only the void could speak back.</p>
        <button className="select-button" id='submit'onClick={handleInvalidAction}>
          Select a Character
        </button>
      </div>
    </div>
  );
};

export default InvalidActionPopup;
