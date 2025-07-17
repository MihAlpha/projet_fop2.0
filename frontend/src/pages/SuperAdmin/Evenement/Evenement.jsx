import React, { useEffect, useState, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaTimes, FaCalendarAlt, FaClock, FaSearch, FaFolderOpen, FaMapPin, FaMapMarker, FaFileAlt, FaUser, FaIdBadge, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Dossier from "./Dossier";
import "./Evenement.css";

const Evenements = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [evenements, setEvenements] = useState([]);
  const [evenementsDuJour, setEvenementsDuJour] = useState([]); 
  const [evenementsDuJourFixe, setEvenementsDuJourFixe] = useState([]);
  const [selectedEvenement, setSelectedEvenement] = useState(null);
  const [dossierOuvert, setDossierOuvert] = useState(null);
  const [filterIM, setFilterIM] = useState("");
  const [filteredEventsByIM, setFilteredEventsByIM] = useState([]);
  const [agentNom, setAgentNom] = useState("");
  const [agentIM, setAgentIM] = useState("");
  const [imExiste, setImExiste] = useState(true);
  const [expandedType, setExpandedType] = useState(null);
  const [agents, setAgents] = useState([]);

  const navigate = useNavigate();
  const calendarBlockRef = useRef(null);

  const documentsParType = {
    Avenant: ["Contrat modifié", "Lettre d'affectation"],
    Renouvellement: ["Lettre de renouvellement", "Lettre d’engagement de l’administration"],
    Intégration: ["Décret d’intégration", "PV de jury"],
    Avancement: ["Attestation de performance", "Demande d’avancement"],
    Retraite: ["Certificat de cessation", "Demande de pension"],
  };

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/evenements/")
      .then(res => setEvenements(res.data))
      .catch(err => console.error("Erreur lors du chargement des événements:", err));

    axios.get("http://127.0.0.1:8000/api/agents/")
      .then(res => setAgents(res.data))
      .catch(err => console.error("Erreur lors du chargement des agents:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const selectedDateStr = selectedDate.toLocaleDateString("fr-CA");
    const filtered = evenements.filter(e => e.date === selectedDateStr);
    setEvenementsDuJour(filtered);
    setSelectedEvenement(null);
  }, [selectedDate, evenements]);

  useEffect(() => {
    const updateTodayEvents = () => {
      const todayStr = new Date().toLocaleDateString("fr-CA");
      const filtered = evenements.filter(e => e.date === todayStr);
      setEvenementsDuJourFixe(filtered);
    };

    updateTodayEvents();
    const interval = setInterval(updateTodayEvents, 60000);
    return () => clearInterval(interval);
  }, [evenements]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarBlockRef.current && !calendarBlockRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (filterIM.trim() === "") {
      setFilteredEventsByIM([]);
      setAgentNom("");
      setAgentIM("");
      setImExiste(true);
      setSelectedEvenement(null);
      return;
    }

    const agentTrouve = agents.find(a => a.im === filterIM);
    if (!agentTrouve) {
      setImExiste(false);
      setAgentNom("");
      setAgentIM("");
      setFilteredEventsByIM([]);
      setSelectedEvenement(null);
      return;
    }

    setImExiste(true);
    setAgentNom(`${agentTrouve.nom} ${agentTrouve.prenom}`);
    setAgentIM(agentTrouve.im);

    const todayStr = new Date().toLocaleDateString("fr-CA");

    const evenementsAgent = evenements
      .filter(e => e.agent.im === filterIM)
      .filter(e => e.date >= todayStr);

    const qualite = agentTrouve.qualite;
    let evenementsValides = [];

    if (["E", "ELD", "EFA"].includes(qualite)) {
      evenementsValides = ["Recrutement", "Avenant", "Renouvellement", "Intégration", "Avancement", "Retraite"];
    } else if (qualite === "Fonctionnaire") {
      evenementsValides = ["Intégration", "Avancement", "Retraite"];
    }

    const eventsFiltres = evenementsAgent.filter(
      e => evenementsValides.includes(e.type_evenement)
    );

    const evenementsTries = eventsFiltres.sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredEventsByIM(evenementsTries);
    setSelectedEvenement(null);
  }, [filterIM, evenements, agents]);

  const handleEventClick = (event) => {
    setSelectedEvenement(event);
    setFilterIM("");
  };

  const handleOpenDossier = (doc) => {
    setDossierOuvert(doc);
  };

  const handleCloseDossier = () => {
    setDossierOuvert(null);
  };

  const formattedDate = currentTime.toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const formattedTime = currentTime.toLocaleTimeString("fr-FR");

  const toggleType = (type) => {
    setExpandedType(expandedType === type ? null : type);
  };

  return (
    <div className="evenements-container">
      <header className="evenements-header">
        <h1>Suivi des événements Automatiques</h1>
        <div className="header-right">
          <button onClick={() => navigate(-1)} className="close-button" aria-label="Retour">
            <FaTimes />
          </button>
        </div>
      </header>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
        <div className="date-container" onClick={() => setShowCalendar(!showCalendar)} tabIndex={0} role="button" aria-label="Afficher calendrier">
          <div className="date-time-block">
            <span style={{ marginRight: "8px", color: "#555" }}>
              <FaCalendarAlt style={{ marginRight: "5px" }} />
              {formattedDate}
            </span>
            <span style={{ marginLeft: "10px", color: "#555" }}>
              <FaClock style={{ marginRight: "5px" }} />
              {formattedTime}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="filterIM" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaSearch />
            Filtrer par IM :
          </label>
          <input
            id="filterIM"
            type="text"
            placeholder="Ex: 12345"
            value={filterIM}
            onChange={(e) => setFilterIM(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>
      </div>

      {showCalendar && (
        <div ref={calendarBlockRef} style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
          <div className="calendar-popup-left">
            <Calendar onChange={setSelectedDate} value={selectedDate} />
          </div>
          <div className="events-today-popup" aria-live="polite">
            <h4><FaCalendarAlt style={{ marginRight: '8px', color: '#f4fcfaff' }} /> Événements de cette date :</h4>
            {evenementsDuJour.length > 0 ? (
              evenementsDuJour.map((e, i) => (
               <div
                  key={i}
                  className="event-line"
                  onClick={() => handleEventClick(e)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Événement ${e.type_evenement} de ${e.agent.nom}`}
                  onKeyDown={(ev) => { if (ev.key === "Enter") handleEventClick(e); }}
                  style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                >
                  <FaSearch />
                  {e.agent.nom} — {e.type_evenement}
                </div>
              ))
            ) : (
              <p>Aucun événement à cette date</p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div className="evenements-center">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaFolderOpen />
            Détails de l’événement sélectionné
          </h3>

          {filterIM && (
            imExiste ? (
              <div>
                <p><strong><FaUser style={{ marginRight: '6px', color: '#083027' }} /> Nom :</strong> {agentNom}</p>
                <p>
                  <strong>
                    <FaIdBadge style={{ marginRight: '6px', color: '#083027' }} />
                    IM :
                  </strong> {agentIM}
                </p>
                {filteredEventsByIM.length > 0 ? (
                  <>
                    <p>
                      <strong>
                        <FaFolderOpen style={{ marginRight: '6px', color: '#083027' }} />
                        Événements :
                      </strong>
                    </p>
                    <ul>
                      {filteredEventsByIM.map((e, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaMapPin />
                          {e.date} — {e.type_evenement}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p style={{ color: "orange", display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaExclamationTriangle />
                    Aucun événement trouvé pour cet agent.
                  </p>
                )}
              </div>
            ) : (
             <p style={{ color: "red", display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaTimesCircle />
                IM introuvable dans la base.
              </p>
            )
          )}

          {!filterIM && selectedEvenement && (
            <div className="event-details" aria-live="polite">
              <p><strong>Nom :</strong> {selectedEvenement.agent.nom} {selectedEvenement.agent.prenom}</p>
              <p><strong>Type :</strong> {selectedEvenement.type_evenement}</p>
              <p><strong>Date :</strong> {selectedEvenement.date}</p>
              <p><strong>IM :</strong> {selectedEvenement.agent.im}</p>

              {selectedEvenement.date <= new Date().toLocaleDateString("fr-CA") && (
                <>
                  <p><strong>Documents requis :</strong></p>
                  <ul>
                    {documentsParType[selectedEvenement.type_evenement]?.map((doc, i) => (
                      <li
                        key={i}
                        style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline", display: "flex", alignItems: "center", gap: "6px" }}
                        onClick={() => handleOpenDossier(doc)}
                      >
                        <FaFileAlt />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </>
              )}

            </div>
          )}

          {!filterIM && !selectedEvenement && (
            <p>Sélectionnez un événement pour voir les détails.</p>
          )}
        </div>
      </div>

      <div className="evenements-footer" aria-live="polite">
        {["Avenant", "Renouvellement", "Intégration", "Avancement", "Retraite"].map((type, index) => {
          const eventsOfTypeToday = evenementsDuJourFixe.filter(e => e.type_evenement === type);

          return (
            <div key={index} className="event-section">
              <h4
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => toggleType(type)}
                tabIndex={0}
                role="button"
                aria-expanded={expandedType === type}
                aria-controls={`events-list-${type}`}
              >
                <FaMapMarker />
                {type} ({eventsOfTypeToday.length})
              </h4>
              {expandedType === type && (
                <div id={`events-list-${type}`}>
                  {eventsOfTypeToday.map((e, i) => (
                    <p
                      key={i}
                      onClick={() => handleEventClick(e)}
                      className="event-line"
                      tabIndex={0}
                      role="button"
                      aria-label={`Événement de ${e.agent.nom}`}
                      style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                    >
                      <FaSearch />
                      {e.agent.nom} {e.agent.prenom}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Affichage du composant Dossier */}
      {dossierOuvert && selectedEvenement && (
        <Dossier
          nomDossier={dossierOuvert}
          agent={selectedEvenement.agent}
          typeEvenement={selectedEvenement.type_evenement}
          event={selectedEvenement} 
          onClose={handleCloseDossier}
        />
      )}
    </div>
  );
};

export default Evenements;
