import React from 'react';

const DeleteMessageModal = ({ isOpen, handleCancel, handleDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="mx-auto w-9/10 max-w-[25rem] h-auto min-h-[10rem] bg-selected-color rounded-lg shadow-md backdrop-blur-[10px] p-4 flex flex-col">
        <h2 className="text-center">Delete Message</h2>
        <p className="text-center">Are you sure you want to delete this message?</p>
        <div className="flex flex-row justify-center">
          <button className="bg-gray-900 rounded-lg shadow-md backdrop-blur-[10px] px-2 py-2 w-auto border-none outline-none text-selected-text-color justify-center h-auto cursor-pointer absolute bottom-5 right-20 hover:bg-blue-600" id='submit' onClick={handleCancel}>Cancel</button>
          <button className="bg-gray-900 rounded-lg shadow-md backdrop-blur-[10px] px-2 py-2 w-auto border-none outline-none text-selected-text-color justify-center h-auto cursor-pointer absolute bottom-5 left-20 hover:bg-red-600" id='cancel' onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMessageModal;
