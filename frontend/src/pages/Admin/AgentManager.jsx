import React, { useState, useEffect } from 'react';
import './AgentManager.css';
import { useNavigate } from 'react-router-dom';
import loupeImage from './rech.ico';
import { FaTimes } from "react-icons/fa";

const AgentManager = () => {
  const navigate = useNavigate();
  const initialFormState = {
    nom: '', prenom: '', email: '', sexe: '', im: '', cin: '', date_naissance: '', date_debut: '',
    diplome: '', direction: '', service: '', corps: '', grade: '', qualite: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [agents, setAgents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agents/');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Erreur lors du chargement des agents', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{12}$/.test(formData.cin)) {
      alert('Le numéro du CIN doit contenir exactement 12 chiffres!');
      return;
    }

    if (!/^\d{6}$/.test(formData.im)) {
      alert('Le numéro d’IM doit contenir exactement 6 chiffres!');
      return;
    }

    const naissance = new Date(formData.date_naissance);
    const debut = new Date(formData.date_debut);
    const diffYears = debut.getFullYear() - naissance.getFullYear();

    if (diffYears < 18) {
      alert('Vérifiez les dates s’il vous plaît!');
      return;
    }

    try {
      const url = editIndex !== null
        ? `http://localhost:8000/api/agents/${agents[editIndex].id}/`
        : 'http://localhost:8000/api/agents/';
      const method = editIndex !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

if (response.ok) {
  fetchAgents();
  setFormData(initialFormState);
  setEditIndex(null);
  setShowForm(false);
} else {
  const errorData = await response.json();
  const errorMessages = Object.values(errorData).flat().join('\n');
  alert(errorMessages || 'Erreur lors de l’enregistrement');
}

    } catch (error) {
      console.error('Erreur :', error);
      alert('Erreur réseau ou serveur lors de l’enregistrement');
    }
  };

  const handleEdit = (index) => {
    setFormData(agents[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const agent = agents[index];
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer l'agent ${agent.nom} ${agent.prenom} ?`);

    if (!confirmDelete) return;

    const agentId = agent.id;
    try {
      const response = await fetch(`http://localhost:8000/api/agents/${agentId}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAgents();
        if (editIndex === index) {
          setEditIndex(null);
          setFormData(initialFormState);
        }
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} style={{ backgroundColor: 'lightblue' }}>{part}</span> : part
    );
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 8;
  const filteredAgents = agents.filter((agent) =>
    Object.values(agent).some(value =>
      value && String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = filteredAgents.slice(indexOfFirstAgent, indexOfLastAgent);


  return (
    <div>
      <div className="agent-container">

        {!showForm ? (
          <>
            <h2>Liste des agents</h2>
            <button onClick={() => navigate(-1)} className="close-button" aria-label="Retour">
              <FaTimes />
            </button>
            <div className="top-bar">
              <button
                className="add-agent-btn"
                onClick={() => {
                  setShowForm(true);
                  setFormData(initialFormState);
                  setEditIndex(null);
                }}
              >
                Ajouter un agent
              </button>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Rechercher un agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <img src={loupeImage} alt="loupe" />
              </div>
            </div>
            {filteredAgents.length > 0 ? (
              <div className="agent-table-wrapper">
                <table className="agent-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Sexe</th>
                      <th>IM</th>
                      <th>CIN</th>
                      <th>Naissance</th>
                      <th>Entrée</th>
                      <th>Diplôme</th>
                      <th>Direction</th>
                      <th>Service</th>
                      <th>Corps</th>
                      <th>Grade</th>
                      <th>Qualité</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAgents.map((agent, index) => (
                      <tr key={agent.id}>
                        <td>{highlightText(agent.nom, searchQuery)}</td>
                        <td>{highlightText(agent.prenom, searchQuery)}</td>
                        <td>{highlightText(agent.email, searchQuery)}</td>
                        <td>{highlightText(agent.sexe, searchQuery)}</td>
                        <td>{highlightText(agent.im, searchQuery)}</td>
                        <td>{highlightText(agent.cin, searchQuery)}</td>
                        <td>{highlightText(agent.date_naissance, searchQuery)}</td>
                        <td>{highlightText(agent.date_debut, searchQuery)}</td>
                        <td>{highlightText(agent.diplome, searchQuery)}</td>
                        <td>{highlightText(agent.direction, searchQuery)}</td>
                        <td>{highlightText(agent.service, searchQuery)}</td>
                        <td>{highlightText(agent.corps, searchQuery)}</td>
                        <td>{highlightText(agent.grade, searchQuery)}</td>
                        <td>{highlightText(agent.qualite, searchQuery)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit" onClick={() => handleEdit(filteredAgents.indexOf(agent))}>✏</button>
                            <button className="delete" onClick={() => handleDelete(filteredAgents.indexOf(agent))}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Aucun agent trouvé.</p>
            )}
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ◀
              </button>
              <span>Page {currentPage} sur {Math.ceil(filteredAgents.length / agentsPerPage)}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAgents.length / agentsPerPage)))}
                disabled={currentPage === Math.ceil(filteredAgents.length / agentsPerPage)}
              >
                ▶
              </button>
            </div>

          </>
        ) : (
          <>
            <form className="agent-form" onSubmit={handleSubmit}>
              <h2>{editIndex !== null ? 'Modifier l’agent' : 'Ajouter un agent'}</h2>
              {[{ name: 'nom', label: 'Nom' }, { name: 'prenom', label: 'Prénom' }].map(({ name, label }) => (
                <div className="input-container" key={name}>
                  <input type="text" name={name} placeholder=" " value={formData[name]} onChange={handleChange} required />
                  <label>{label}</label>
                </div>
              ))}
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label>Email</label>
              </div>
              <div className="input-container">
                <select name="sexe" value={formData.sexe} onChange={handleChange} className={formData.sexe !== "" ? 'has-value' : ''} required>
                  <option value="" disabled hidden> </option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
                <label>Sexe</label>
              </div>

              <div className="row">
                {['date_naissance', 'date_debut'].map(field => (
                  <div className="input-container half-field" key={field}>
                    <input type="date" name={field} placeholder=" " value={formData[field]} onChange={handleChange} required />
                    <label>{field === 'date_naissance' ? 'Date de naissance' : 'Date de début'}</label>
                  </div>
                ))}
              </div>

              <div className="row">
                {['im', 'cin'].map(field => (
                  <div className="input-container half-field" key={field}>
                    <input type="text" name={field} placeholder=" " value={formData[field]} onChange={handleChange} required />
                    <label>{field.toUpperCase()}</label>
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="input-container half-field">
                  <select name="direction" value={formData.direction} onChange={handleChange} className={formData.direction !== "" ? 'has-value' : ''} required>
                    <option value="" disabled hidden> </option>
                    {['DPSSE', 'DIR.COM', 'DRHM', 'DRTEFOP', 'DSI', 'DGT', 'DTPDF', 'DMP', 'DSST', 'DGPE'].map(dir => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </select>
                  <label>Direction</label>
                </div>
                <div className="input-container half-field">
                  <select name="qualite" value={formData.qualite} onChange={handleChange} className={formData.qualite !== "" ? 'has-value' : ''} required>
                    <option value="" disabled hidden> </option>
                    {['EFA', 'ELD', 'E', 'Fonctionnaire'].map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <label>Qualité</label>
                </div>
              </div>

              <div className="row">
                {['diplome', 'service'].map(field => (
                  <div className="input-container half-field" key={field}>
                    <input type="text" name={field} placeholder=" " value={formData[field]} onChange={handleChange} />
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  </div>
                ))}
              </div>

              <div className="row">
                {['corps', 'grade'].map(field => (
                  <div className="input-container half-field" key={field}>
                    <input type="text" name={field} placeholder=" " value={formData[field]} onChange={handleChange} />
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  </div>
                ))}
              </div>
              <div className="button-container">
                <button type="submit">{editIndex !== null ? 'Modifier' : 'Enregistrer'}</button>
                <button type="button" className="cancel-button" onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormState);
                  setEditIndex(null);
                }}>
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentManager;
