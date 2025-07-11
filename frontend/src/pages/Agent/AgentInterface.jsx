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
    // 🟢 Récupère l'ID depuis l'URL : /agent-interface/93
    const pathParts = window.location.pathname.split('/');
    const agentId = pathParts[pathParts.length - 1];

    if (!agentId) {
      console.error("❌ agent_id est introuvable dans l’URL");
      return;
    }

    localStorage.setItem('agent_id', agentId); // au cas où tu veux l’utiliser ailleurs

    // 🔵 Fetch les infos de l’agent
    fetch(`http://localhost:8000/api/agents/${agentId}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération de l'agent");
        return res.json();
      })
      .then((data) => this.setState({ agent: data }))
      .catch((err) => console.error("❌ Erreur fetch agent:", err));

    // 🔵 Fetch les événements du jour
    fetch(`http://localhost:8000/api/evenements/?agent_id=${agentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération des événements");
        return res.json();
      })
      .then((data) => this.setState({ evenementsDuJour: data }))
      .catch((err) => console.error("❌ Erreur fetch événements:", err));
  }

  afficherDossier = (evenement) => {
    const agentId = this.state.agent?.id;
    const type = evenement.type_evenement;

    fetch(`http://localhost:8000/api/verifier-signature/?agent_id=${agentId}&evenement=${type}&nom_dossier=${evenement.nom_dossier}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la vérification de signature");
        return res.json();
      })
      .then((data) => {
        this.setState({
          dossierVisible: evenement,
          dossierSigne: data.signature_existe,
        });
      })
      .catch((err) => console.error("❌ Erreur fetch signature:", err));
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
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de l’enregistrement de la signature");
        return res.json();
      })
      .then(() => {
        this.setState({ dossierSigne: true });
      })
      .catch((err) => console.error("❌ Erreur enregistrement signature:", err));
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
      // Ajoute ici tous les autres types de dossiers
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
                <SignaturePad
                  ref={this.signaturePadRef}
                  canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
                />
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
