import React from "react";

const rolesAutorises = ["SuperAdmin", "Admin"];

function ConversationList({ onSelectConversation, roleSelectionne }) {
  return (
    <div className="conversation-list">
      <h3>Conversations</h3>
      <ul>
        {rolesAutorises.map((role) => (
          <li key={role}>
            <button
              className={role === roleSelectionne ? "selected" : ""}
              onClick={() => onSelectConversation(role)}
            >
              {role}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationList;
