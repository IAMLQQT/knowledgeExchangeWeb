import React from "react";
import "../scss/PopUpChat.scss"
const PopUpChat = ({ openMessenger, onViewProfile, onDeleteChat, recipientId }) => {
  return (
    <div className="popup-menu">
      <ul>
        <li  onClick={() => openMessenger()}> Open Messenger</li>
        <li>Add Group</li>
        <li onClick={() => onViewProfile(recipientId)}>View Profile</li>
      </ul>
    </div>
  );
};

export default PopUpChat;
