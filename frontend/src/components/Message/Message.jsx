import React, { useEffect, useState } from 'react';
import './Message.css';

function Message() {
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [destinataireId, setDestinataireId] = useState('');
  const [nouveauMessage, setNouveauMessage] = useState('');


  const superadminId = 1; 
 
  useEffect(() => {
    fetch(`http://localhost:8000/api/agents/`)
      .then(res => res.json())
      .then(setAgents)
      .catch(console.error);
  }, []);

 
  useEffect(() => {
    if (!destinataireId) return;
    fetch(`http://localhost:8000/api/conversation/${superadminId}/Agent/`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
      .then(setMessages)
      .catch(console.error);
  }, [destinataireId]);

  const envoyerMessage = () => {
    if (!nouveauMessage.trim() || !destinataireId) {
      alert("Choisissez un agent et écrivez un message");
      return;
    }

    fetch("http://localhost:8000/api/messages/envoyer/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expediteur_id: superadminId,
        expediteur_role: "SuperAdmin",
        destinataire_role: "Agent",
        destinataire_id: parseInt(destinataireId),
        contenu: nouveauMessage,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
      .then(msg => {
        setMessages(prev => [...prev, msg]);
        setNouveauMessage("");
      })
      .catch(console.error);
  };

  return (
    <div className="superadmin-message-container">
      <h2>💬 Interface Messagerie - SuperAdmin</h2>

      <section className="messages-recus">
        <h3>📨 Messages reçus</h3>
        <ul>
          {messages.map(m => (
            <li key={m.id} className="message-item">
              <b>
                {m.expediteur?.nom
                  ? `${m.expediteur.nom} ${m.expediteur.prenom}`
                  : m.expediteur_role}
              </b>: {m.contenu}
              <br />
              <small>{new Date(m.date_envoi).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="envoyer-message">
        <h3>✉️ Envoyer un message à un agent</h3>

        <select
          onChange={e => setDestinataireId(e.target.value)}
          value={destinataireId}
        >
          <option value="" disabled>Choisir un agent</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.nom} {agent.prenom}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Écrire un message..."
          value={nouveauMessage}
          onChange={e => setNouveauMessage(e.target.value)}
        />

        <button
          className="btn-envoyer"
          onClick={envoyerMessage}
          disabled={!nouveauMessage.trim() || !destinataireId}
        >
          Envoyer
        </button>
      </section>
    </div>
  );
}

export default Message;
