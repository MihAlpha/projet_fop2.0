import React, { Component } from 'react';
import SignaturePad from 'react-signature-canvas';
import './AgentInterface.css';

import ContratModifie from '../../dossiers/avenant/ContratModifie';
import LettreAffectation from '../../dossiers/avenant/LettreAffectation';
import AttestationDePerformance from '../../dossiers/avancement/AttestationDePerformance';
import DemandeAvancement from '../../dossiers/avancement/DemandeAvancement';
import DecretIntegration from '../../dossiers/integration/DecretIntegration';
import PVJury from '../../dossiers/integration/PVJury';
import EngagementAdministration from '../../dossiers/renouvellement/EngagementAdministration';
import LettreRenouvellement from '../../dossiers/renouvellement/LettreRenouvellement';
import CertificatCessation from '../../dossiers/retraite/CertificatCessation';
import DemandePension from '../../dossiers/retraite/DemandePension';

const documentsParType = {
  Avenant: ["Contrat modifié", "Lettre d'affectation"],
  Renouvellement: ["Lettre de renouvellement", "Lettre d’engagement de l’administration"],
  Intégration: ["Décret d’intégration", "PV de jury"],
  Avancement: ["Attestation de performance", "Demande d’avancement"],
  Retraite: ["Certificat de cessation", "Demande de pension"],
};

const composantsDossier = {
  "Contrat modifié": ContratModifie,
  "Lettre d'affectation": LettreAffectation,
  "Attestation de performance": AttestationDePerformance,
  "Demande d’avancement": DemandeAvancement,
  "Décret d’intégration": DecretIntegration,
  "PV de jury": PVJury,
  "Lettre de renouvellement": LettreRenouvellement,
  "Lettre d’engagement de l’administration": EngagementAdministration,
  "Certificat de cessation": CertificatCessation,
  "Demande de pension": DemandePension,
};

class AgentInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agent: null,
      evenementsDuJour: [],
      typeSelectionne: null,
      dossierNom: null,
      dossierSigne: false,
      destinataireRole: "SuperAdmin",
      messages: [],
      nouveauMessage: "",
    };
    this.signaturePadRef = React.createRef();
  }

  componentDidMount() {
    const agentId = window.location.pathname.split('/').pop();
    localStorage.setItem('agent_id', agentId);

    fetch(`http://localhost:8000/api/agents/${agentId}/`)
      .then(res => res.json())
      .then(agent => {
        this.setState({ agent });
        this.chargerMessages(agent.id, this.state.destinataireRole);
      })
      .catch(err => console.error("Erreur récupération agent:", err));

    fetch(`http://localhost:8000/api/evenements-du-jour/?agent_id=${agentId}`)
      .then(res => res.json())
      .then(data => this.setState({ evenementsDuJour: data }))
      .catch(() => console.error("Erreur lors de la récupération des événements"));
  }

  chargerMessages = (agentId, destinataireRole) => {
    if (!agentId || !destinataireRole) return;
    fetch(`http://localhost:8000/api/messages/?expediteur_id=${agentId}&destinataire=${destinataireRole}`)
      .then(res => res.json())
      .then(data => this.setState({ messages: data }))
      .catch(err => console.error("⚠️ Erreur chargement messages", err));
  };

  afficherDossier = (evenement) => {
    this.setState({
      typeSelectionne: evenement.type_evenement,
      dossierNom: null,
      dossierSigne: false,
    });
  };

  handleChoisirDocument = (nom) => {
    const { agent, typeSelectionne } = this.state;
    this.setState({ dossierNom: nom });

    fetch(`http://localhost:8000/api/verifier-signature/?agent_id=${agent.id}&evenement=${typeSelectionne}&nom_dossier=${nom}`)
      .then(res => res.json())
      .then(data => this.setState({ dossierSigne: data.signature_existe }))
      .catch(() => this.setState({ dossierSigne: false }));
  };

  handleFermer = () => {
    this.setState({ dossierNom: null, dossierSigne: false });
  };

  handleValiderSignature = () => {
    const signatureImage = this.signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
    this.setState({ dossierSigne: true });
    // Envoi vers le backend si besoin
  };

  envoyerMessage = () => {
    const { nouveauMessage, agent, destinataireRole } = this.state;

    if (!nouveauMessage.trim() || !agent?.id || !destinataireRole) {
      console.warn("⚠️ Message vide ou destinataire manquant");
      return;
    }

    fetch("http://localhost:8000/api/messages/envoyer/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expediteur_id: agent.id,
        expediteur_role: "Agent",
        destinataire_id: null,
        destinataire_role: destinataireRole,  
        contenu: nouveauMessage,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
      .then((msg) => {
        this.setState((prev) => ({
          messages: [...prev.messages, msg],
          nouveauMessage: "",
        }));
      })
      .catch(err => {
        console.error("❌ Erreur envoi message", err);
      });
  };

  renderDossier() {
    const { dossierNom, agent } = this.state;
    if (!dossierNom) return null;

    const Composant = composantsDossier[dossierNom];
    if (!Composant) return <p>Dossier inconnu</p>;

    return <Composant agent={agent} />;
  }

  render() {
    const { agent, evenementsDuJour, typeSelectionne, dossierNom, messages, nouveauMessage } = this.state;

    return (
      <div className="agent-container">
        <h2>Bienvenue, {agent?.prenom} {agent?.nom}</h2>
        <p><strong>Email :</strong> {agent?.email}</p>
        <p><strong>Matricule :</strong> {agent?.im}</p>

        <h3>📅 Événements du jour</h3>
        <ul>
          {evenementsDuJour.map((event) => (
            <li key={event.id}>
              <strong>{event.type_evenement}</strong>
              <button onClick={() => this.afficherDossier(event)}>Voir les dossiers</button>

              {typeSelectionne === event.type_evenement && (
                <ul>
                  {documentsParType[event.type_evenement]?.map((doc) => (
                    <li key={doc}>
                      <button onClick={() => this.handleChoisirDocument(doc)}>
                        {doc}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {dossierNom && (
          <div className="dossier-container">
            <div className="dossier-header">
              <button onClick={this.handleFermer}>Fermer</button>
            </div>
            <div className="dossier-contenu">
              {this.renderDossier()}
              {!this.state.dossierSigne && (
                <>
                  <SignaturePad ref={this.signaturePadRef} canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }} />
                  <button onClick={this.handleValiderSignature}>Valider la signature</button>
                </>
              )}
              {this.state.dossierSigne && <p>✅ Dossier signé</p>}
            </div>
          </div>
        )}

        <div className="messagerie">
          <h3>💬 Messagerie</h3>
          <div className="conversation">
            <ul className="message-list">
              {messages.map((msg) => (
                <li key={msg.id} className={msg.expediteur?.id === agent?.id ? "agent-msg" : "admin-msg"}>
                  <b>{msg.expediteur?.nom ? `${msg.expediteur.nom} ${msg.expediteur.prenom}` : msg.expediteur_role}</b>: {msg.contenu}
                  <br />
                  <small>{new Date(msg.date_envoi).toLocaleTimeString()}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className="message-form">
            <textarea
              placeholder="Écrire un message..."
              value={nouveauMessage}
              onChange={(e) => this.setState({ nouveauMessage: e.target.value })}
            />
            <button className="envoyer-btn" onClick={this.envoyerMessage}>Envoyer</button>
          </div>
        </div>
      </div>
    );
  }
}

export default AgentInterface;
