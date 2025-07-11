import React, { Component } from 'react';
import SignaturePad from 'react-signature-canvas';
import './AgentInterface.css';
import AttestationDePerformance from '../../dossiers/avancement/AttestationDePerformance';
import ContratModifie from '../../dossiers/avenant/ContratModifie';
// Importe ici tous les autres dossiers possibles...

class AgentInterface extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agent: null,
      evenementsDuJour: [],
      dossierVisible: null,
      signatureData: null,
      dossierSigne: false,
    };
    this.signaturePadRef = React.createRef();
  }

  componentDidMount() {
    const agentId = localStorage.getItem('agent_id');
    fetch(`http://localhost:8000/api/agent/${agentId}/`)
      .then((res) => res.json())
      .then((data) => this.setState({ agent: data }));

    fetch(`http://localhost:8000/api/evenements-du-jour/?agent_id=${agentId}`)
      .then((res) => res.json())
      .then((data) => this.setState({ evenementsDuJour: data }));
  }

  afficherDossier = (evenement) => {
    const agentId = this.state.agent?.id;
    const type = evenement.type_evenement;

    fetch(`http://localhost:8000/api/verifier-signature/?agent_id=${agentId}&evenement=${type}&nom_dossier`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          dossierVisible: evenement,
          dossierSigne: data.signature_existe,
        });
      });
  };

  handleFermer = () => {
    this.setState({
      dossierVisible: null,
      signatureData: null,
    });
  };

  handleValiderSignature = () => {
    const signatureImage = this.signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
    const { agent, dossierVisible } = this.state;

    fetch('http://localhost:8000/api/enregistrer-signature/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: agent.id,
        evenement: dossierVisible.type_evenement,
        nom_dossier: dossierVisible.nom_dossier,
        signature: signatureImage,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        this.setState({ dossierSigne: true });
      });
  };

  renderDossier() {
    const { dossierVisible, agent } = this.state;
    if (!dossierVisible) return null;

    const props = {
      agent,
      evenement: dossierVisible,
    };

    const composants = {
      "Attestation de performance": <AttestationDePerformance {...props} />,
      "Contrat modifié": <ContratModifie {...props} />,
      // Ajoute ici tous les autres types de dossiers que tu as
    };

    return composants[dossierVisible.nom_dossier] || <p>Dossier inconnu</p>;
  }

  render() {
    const { agent, evenementsDuJour, dossierVisible, dossierSigne } = this.state;

    return (
      <div className="agent-container">
        <h2>Bienvenue, {agent?.prenom} {agent?.nom}</h2>
        <p><strong>Email :</strong> {agent?.email}</p>
        <p><strong>Matricule :</strong> {agent?.matricule}</p>

        <h3>Événements du jour</h3>
        <ul>
          {evenementsDuJour.map((event) => (
            <li key={event.id}>
              {event.nom_dossier} - {event.type_evenement}
              <button onClick={() => this.afficherDossier(event)}>Voir le dossier</button>
            </li>
          ))}
        </ul>

        {dossierVisible && (
          <div className="dossier-container">
            <div className="dossier-header">
              <button onClick={this.handleFermer}>Fermer</button>
              <button onClick={() => window.print()}>Télécharger</button>
            </div>

            <div className="dossier-contenu">
              {this.renderDossier()}
            </div>

            {!dossierSigne && (
              <div className="signature-zone">
                <h4>Signature :</h4>
                <SignaturePad ref={this.signaturePadRef} canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }} />
                <button onClick={this.handleValiderSignature}>Valider</button>
              </div>
            )}

            {dossierSigne && (
              <p className="signature-ok">✅ Dossier déjà signé</p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default AgentInterface;