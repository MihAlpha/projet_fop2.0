import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTimes, FaPaperPlane, FaComments } from 'react-icons/fa';
import './SuperAdminMessenger.css';

function MessengerSuperAdmin() {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(() => localStorage.getItem('selectedAgentId') || '');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(!!localStorage.getItem('selectedAgentId'));
  const messagesEndRef = useRef(null);

  const superAdminId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/agents/')
      .then(res => setAgents(res.data))
      .catch(err => console.error('Erreur chargement agents:', err));
  }, []);

  useEffect(() => {
    if (!selectedAgentId || !superAdminId) {
      setMessages([]);
      return;
    }

    axios
      .get(`http://localhost:8000/api/conversation/${selectedAgentId}/SuperAdmin/`)
      .then(res => setMessages(res.data))
      .catch(err => {
        console.error('Erreur chargement messages:', err);
        setMessages([]);
      });
  }, [selectedAgentId, superAdminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChange = (e) => {
    const agentId = e.target.value;
    setSelectedAgentId(agentId);
    localStorage.setItem('selectedAgentId', agentId);
    setChatOpen(!!agentId);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedAgentId) return;

    const messageData = {
      expediteur_id: superAdminId,
      expediteur_role: 'SuperAdmin',
      destinataire_id: selectedAgentId,
      destinataire_role: 'Agent',
      contenu: newMessage.trim(),
      date_envoi: new Date().toISOString(),
    };

    axios
      .post('http://localhost:8000/api/messages/envoyer/', messageData)
      .then(() => {
        setNewMessage('');
        return axios.get(`http://localhost:8000/api/conversation/${selectedAgentId}/SuperAdmin/`);
      })
      .then(res => setMessages(res.data))
      .catch(err => console.error('Erreur envoi message:', err));
  };

  const closeChat = () => {
    setSelectedAgentId('');
    setMessages([]);
    setChatOpen(false);
    localStorage.removeItem('selectedAgentId');
  };

  return (
    <div className="messenger-container">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaComments />
        Messagerie SuperAdmin
      </h2>


      {!chatOpen && (
        <div className="agent-select-section">
          <label htmlFor="agent-select">Choisir un agent :</label>
          <select
            id="agent-select"
            value={selectedAgentId}
            onChange={handleSelectChange}
          >
            <option value="">-- Sélectionner un agent --</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.nom} {agent.prenom}
              </option>
            ))}
          </select>
        </div>
      )}

      {chatOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <h3>
              Conversation avec {agents.find(a => a.id === Number(selectedAgentId))?.nom || 'Agent'} {agents.find(a => a.id === Number(selectedAgentId))?.prenom || ''}
            </h3>
            <button className="close-btn" onClick={closeChat} title="Fermer">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="messages-section">
            {messages.length === 0 ? (
              <p>Aucun message.</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={
                    msg.expediteur_role === 'SuperAdmin'
                      ? 'message superadmin-message'
                      : 'message agent-message'
                  }
                >
                  <strong>{msg.expediteur_role} :</strong> {msg.contenu}
                  <div className="message-date">
                    {new Date(msg.date_envoi).toLocaleString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="send-message-section">
            <textarea
              placeholder="Écrire un message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !selectedAgentId}
              title={!newMessage.trim() ? "Écris un message" : !selectedAgentId ? "Sélectionne un agent" : "Envoyer"}
            >
              <FaPaperPlane style={{ marginRight: '6px' }} />
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessengerSuperAdmin;
