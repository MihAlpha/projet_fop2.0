import React, { useEffect, useState } from "react";

function AgentList({ onSelectAgent, agentSelectionne }) {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/agents/")
      .then(res => res.json())
      .then(data => setAgents(data))
      .catch(console.error);
  }, []);

  return (
    <div className="agent-list">
      <h3>Liste des agents</h3>
      <ul>
        {agents.map(agent => (
          <li key={agent.id}>
            <button
              className={agent.id === agentSelectionne ? "selected" : ""}
              onClick={() => onSelectAgent(agent.id)}
            >
              {agent.nom} {agent.prenom}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AgentList;
