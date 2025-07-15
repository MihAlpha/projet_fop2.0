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
    };
    this.signaturePadRef = React.createRef();
  }

  componentDidMount() {
    if (!localStorage.getItem('role')) {
      localStorage.setItem('role', 'agent');
    }

    const agentId = window.location.pathname.split('/').pop();
    localStorage.setItem('agent_id', agentId);

    fetch(`http://localhost:8000/api/agents/${agentId}/`)
      .then((res) => res.json())
      .then((data) => this.setState({ agent: data }))
      .catch(() => console.error("Erreur lors de la récupération de l'agent"));

    fetch(`http://localhost:8000/api/evenements-du-jour/?agent_id=${agentId}`)
      .then((res) => res.json())
      .then((data) => this.setState({ evenementsDuJour: data }))
      .catch(() => console.error("Erreur lors de la récupération des événements"));
  }

  afficherDossier = (evenement) => {
    this.setState({
      typeSelectionne: evenement.type_evenement,
      dossierNom: null,
      dossierSigne: false,
    });
  };

  handleChoisirDocument = (nom) => {
    this.setState({ dossierNom: nom });

    const agentId = this.state.agent?.id;
    const type = this.state.typeSelectionne;

    fetch(`http://localhost:8000/api/verifier-signature/?agent_id=${agentId}&evenement=${type}&nom_dossier=${nom}`)
      .then((res) => res.json())
      .then((data) => this.setState({ dossierSigne: data.signature_existe }))
      .catch(() => console.error("Erreur vérification signature"));
  };

  handleFermer = () => {
    this.setState({ dossierNom: null, dossierSigne: false });
  };

  handleValiderSignature = () => {
    const signatureImage = this.signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
    const { agent, typeSelectionne, dossierNom } = this.state;

    fetch('http://localhost:8000/api/enregistrer_signature/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: agent.id,
        evenement: typeSelectionne,
        nom_dossier: dossierNom,
        signature: signatureImage,
      }),
    })
      .then((res) => res.json())
      .then(() => this.setState({ dossierSigne: true }))
      .catch(() => console.error("Erreur lors de l'enregistrement de la signature"));
  };

  renderDossier() {
    const { dossierNom, agent } = this.state;
    if (!dossierNom) return null;

    const Composant = composantsDossier[dossierNom];
    if (!Composant) return <p>Dossier inconnu</p>;

    return <Composant agent={agent} />;
  }

  render() {
    const { agent, evenementsDuJour, typeSelectionne, dossierNom, dossierSigne } = this.state;

    return (
      <div className="agent-container">
        <div className="profil-box">
          <h2 className="welcome-text">Bienvenue, {agent?.prenom} {agent?.nom}</h2>
          <p><strong>Email :</strong> {agent?.email}</p>
          <p><strong>Matricule :</strong> {agent?.im}</p>
        </div>

        <div className="evenements-section">
          <h3>Événements du jour</h3>
          <ul className="event-list">
            {evenementsDuJour.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-title">
                  <strong>{event.type_evenement}</strong>
                  <button className="voir-dossier-btn" onClick={() => this.afficherDossier(event)}>Voir les dossiers</button>
                </div>

                {typeSelectionne === event.type_evenement && (
                  <ul className="document-list">
                    {documentsParType[event.type_evenement]?.map((doc) => (
                      <li key={doc}>
                        <button className="document-btn" onClick={() => this.handleChoisirDocument(doc)}>
                          {doc}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {dossierNom && (
          <div className="dossier-container">
            <div className="dossier-header">
              <button className="fermer-btn" onClick={this.handleFermer}>Fermer</button>
            </div>
            <div className="dossier-contenu">
              {this.renderDossier()}
            </div>

            {dossierSigne && (
              <div className="signature-confirmation">
                ✅ Signature déjà enregistrée pour ce dossier.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default AgentInterface;
