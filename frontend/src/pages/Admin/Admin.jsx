import React from 'react';
import { useNavigate } from 'react-router-dom';
import agentsData from '../../data/agentsData'; // importe tes agents simulés
import { calculerEvenement } from '../../utils/evenements'; // importe la logique de déclenchement

function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); // Supprimer la session
    navigate('/'); // Redirection vers la page de connexion
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Bienvenue dans l'interface Administrateur 👤</h2>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white' }}>
          🔒 Déconnexion
        </button>
      </div>

      {/* Partie événements */}
      <div style={{ marginTop: '40px' }}>
        <h3>📋 Liste des agents et événements déclenchés</h3>
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>IM</th>
              <th>CIN</th>
              <th>Date de naissance</th>
              <th>Date d'entrée</th>
              <th>🎯 Événement</th>
            </tr>
          </thead>
          <tbody>
            {agentsData.map((agent, index) => (
              <tr key={index}>
                <td>{agent.nom}</td>
                <td>{agent.prenom}</td>
                <td>{agent.im}</td>
                <td>{agent.cin}</td>
                <td>{agent.date_naissance}</td>
                <td>{agent.date_entree}</td>
                <td><strong>{calculerEvenement(agent)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
