import React, { Component } from 'react';
import SignaturePad from 'react-signature-canvas';
import { FaPaperPlane } from 'react-icons/fa'; // pour icône bouton envoyer
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
    this.messagesEndRef = React.createRef();
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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages.length !== this.state.messages.length) {
      this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  chargerMessages = (agentId, destinataireRole) => {
    if (!agentId || !destinataireRole) return;

    fetch(`http://localhost:8000/api/conversation/${agentId}/${destinataireRole}/`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur HTTP " + res.status);
        return res.json();
      })
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
    // TODO: Envoyer signatureImage au backend si nécessaire
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
        contenu: nouveauMessage.trim(),
        date_envoi: new Date().toISOString(),
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
      <div className="messenger-container">
        <h2>Bienvenue, {agent?.prenom} {agent?.nom}</h2>
        <p style={{ textAlign: 'center', color: '#20807a', fontWeight: '600', marginBottom: '15px' }}>
          Email : {agent?.email} — Matricule : {agent?.im}
        </p>

        <section className="evenements-section">
          <h3>📅 Événements du jour</h3>
          <ul className="event-list">
            {evenementsDuJour.map(event => (
              <li key={event.id} className="event-item">
                <div className="event-title">
                  <strong>{event.type_evenement}</strong>
                  <button
                    className="voir-dossier-btn"
                    onClick={() => this.afficherDossier(event)}
                  >
                    Voir les dossiers
                  </button>
                </div>
                {typeSelectionne === event.type_evenement && (
                  <ul className="document-list">
                    {documentsParType[event.type_evenement]?.map(doc => (
                      <li key={doc}>
                        <button
                          className="document-btn"
                          onClick={() => this.handleChoisirDocument(doc)}
                        >
                          {doc}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        {dossierNom && (
          <section className="dossier-container">
            <div className="dossier-header">
              <button className="fermer-btn" onClick={this.handleFermer}>Fermer</button>
            </div>
            <div className="dossier-contenu">
              {this.renderDossier()}
              {!this.state.dossierSigne && (
                <div className="signature-zone">
                  <SignaturePad
                    ref={this.signaturePadRef}
                    canvasProps={{ className: 'signature-canvas' }}
                  />
                  <button className="valider-btn" onClick={this.handleValiderSignature}>
                    Valider la signature
                  </button>
                </div>
              )}
              {this.state.dossierSigne && (
                <p className="signature-confirmation">✅ Dossier signé</p>
              )}
            </div>
          </section>
        )}

        <section className="messagerie">
          <h3>💬 Messagerie</h3>
          <div className="messages-section">
            {messages.length === 0 && (
              <p style={{ color: '#606770', textAlign: 'center' }}>Aucun message.</p>
            )}
            {messages.map(msg => {
              const isAgent = msg.expediteur?.id === agent?.id;
              return (
                <div
                  key={msg.id}
                  className={isAgent ? "superadmin-message message" : "agent-message message"}
                >
                  <div>
                    <strong>
                      {msg.expediteur?.nom
                        ? `${msg.expediteur.nom} ${msg.expediteur.prenom}`
                        : msg.expediteur_role}
                      :
                    </strong>{" "}
                    {msg.contenu}
                  </div>
                  <div className="message-date">
                    {new Date(msg.date_envoi).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
            <div ref={this.messagesEndRef} />
          </div>

          <div className="send-message-section">
            <textarea
              placeholder="Écrire un message..."
              value={nouveauMessage}
              onChange={e => this.setState({ nouveauMessage: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  this.envoyerMessage();
                }
              }}
            />
            <button
              onClick={this.envoyerMessage}
              disabled={!nouveauMessage.trim()}
              title={!nouveauMessage.trim() ? "Écris un message" : "Envoyer"}
            >
              <FaPaperPlane style={{ marginRight: 6 }} />
              Envoyer
            </button>
          </div>
        </section>
      </div>
    );
  }
}

export default AgentInterface;
