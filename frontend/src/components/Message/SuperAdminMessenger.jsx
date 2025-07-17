import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SuperAdminMessenger() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // ID réel du SuperAdmin connecté (à adapter dynamiquement plus tard)
  const superAdminId = JSON.parse(localStorage.getItem('user'))?.id;

  // Charger tous les agents disponibles
  useEffect(() => {
    axios
      .get('http://localhost:8000/api/agents/') // Endpoint pour récupérer les vrais agents
      .then((res) => setAgents(res.data))
      .catch((err) => console.error('Erreur lors du chargement des agents', err));
  }, []);

  // Charger les messages avec l’agent sélectionné
  useEffect(() => {
    if (!selectedAgentId || !superAdminId) return;

    axios
      .get(`http://localhost:8000/api/conversation/${selectedAgentId}/SuperAdmin/`)
      .then((res) => setMessages(res.data))
      .catch((err) => {
        console.error('Erreur lors du chargement des messages', err);
        setMessages([]);
      });
  }, [selectedAgentId, superAdminId]);

  // Envoyer un message
  const envoyerMessage = () => {
    if (!newMessage.trim() || !selectedAgentId) return;

    const messageData = {
      expediteur_id: superAdminId,
      expediteur_role: 'SuperAdmin',
      destinataire_id: selectedAgentId,
      destinataire_role: 'Agent',
      contenu: newMessage,
      date_envoi: new Date().toISOString(),
    };

    axios
      .post('http://localhost:8000/api/messages/envoyer/', messageData)
      .then(() => {
        setNewMessage('');
        // Recharger les messages après envoi
        return axios.get(`http://localhost:8000/api/conversation/${selectedAgentId}/SuperAdmin/`);
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error('Erreur lors de l’envoi du message', err));
  };

  return (
    <div className="messenger-container">
      <h2>Messagerie SuperAdmin</h2>

      {/* Liste déroulante des agents */}
      <label>Choisir un agent :</label>
      <select
        value={selectedAgentId}
        onChange={(e) => setSelectedAgentId(e.target.value)}
      >
        <option value="">-- Sélectionner un agent --</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.nom} {agent.prenom}
          </option>
        ))}
      </select>

      {/* Affichage des messages */}
      <div className="messages-section">
        {messages.length === 0 ? (
          <p>Aucun message pour le moment.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.expediteur_role === 'SuperAdmin'
                  ? 'message superadmin-message'
                  : 'message agent-message'
              }
            >
              <strong>{msg.expediteur_role} :</strong> {msg.contenu}
              <div className="message-date">{new Date(msg.date_envoi).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      {/* Zone de saisie */}
      <div className="send-message-section">
        <textarea
          placeholder="Écrire un message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={envoyerMessage}>Envoyer</button>
      </div>
    </div>
  );
}

export default SuperAdminMessenger;
