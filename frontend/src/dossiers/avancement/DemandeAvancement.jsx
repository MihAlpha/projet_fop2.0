import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import SignaturePad from '../../components/SignaturePad';

const DemandeAvancement = ({ agent }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Avancement";
  const nom_dossier = "Demande d’avancement";

  // Charger la signature existante depuis le backend
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get_signature/?agent_id=${agent.id}&evenement=${type_evenement}&nom_dossier=${encodeURIComponent(nom_dossier)}`);
        const data = await response.json();

        if (response.ok && data.signature_image) {
          setSignature(data.signature_image);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la signature :", error);
      }
    };

    if (agent && agent.id) {
      fetchSignature();
    }
  }, [agent]);

  // Envoi de la signature vers le backend
  const envoyerSignature = async (signatureImage) => {
    try {
      const data = {
        agent: agent.id,
        evenement: type_evenement,
        nom_dossier: nom_dossier,
        signature_image: signatureImage,
      };

      const response = await fetch("http://localhost:8000/api/enregistrer_signature/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Signature enregistrée avec succès !");
      } else {
        alert("❌ Erreur : " + result.message);
      }
    } catch (error) {
      alert("⚠️ Erreur de connexion.");
      console.error(error);
    }
  };

  return (
    <div style={{
      width: '794px',
      margin: '0 auto',
      paddingRight: '63px',
      paddingBottom: '100px',
      fontFamily: 'Georgia, serif',
      backgroundColor: 'white',
      color: 'black',
      boxSizing: 'border-box',
      lineHeight: '1.8em',
      position: 'relative'
    }}>
      {/* En-tête */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <img
          src={logo}
          alt="Logo Ministère"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Titre */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: '30px',
        textTransform: 'uppercase'
      }}>
        Demande d’avancement
      </h2>

      {/* Texte */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, immatriculé(e) sous le numéro <strong>{agent.im}</strong>,
        sollicite respectueusement un avancement de grade ou d’échelon conformément aux dispositions réglementaires régissant la carrière des agents publics.
      </p>

      <p>
        Ma demande s’appuie sur l’ancienneté acquise, les performances professionnelles constatées, ainsi que les évaluations annuelles favorables
        établies par ma hiérarchie.
      </p>

      <p>
        Je reste disponible pour toute information complémentaire ou entretien qui pourrait être requis dans le cadre de cette procédure.
      </p>

      <p>
        Dans l’attente d’une suite favorable, je vous prie d’agréer, Madame, Monsieur, l’expression de ma considération distinguée.
      </p>

      {/* Signature */}
      <div style={{
        marginTop: '180px',
        textAlign: 'right',
        width: '250px',
        float: 'right'
      }}>
        <p>Antananarivo, le {today}</p>
        <p style={{ marginTop: '60px' }}><strong>Signature de l’agent</strong></p>

        {signature ? (
          <img src={signature} alt="signature" style={{ width: '100%', height: '80px', objectFit: 'contain' }} />
        ) : (
          <button onClick={() => setShowSignature(true)}>✍️ Signer</button>
        )}

        <p style={{ marginTop: '10px' }}>{agent.nom} {agent.prenom}</p>
      </div>

      {/* Modale de signature */}
      {showSignature && (
        <SignaturePad
          nomPrenom={`${agent.nom} ${agent.prenom}`}
          onClose={() => setShowSignature(false)}
          onValidate={(img) => {
            setSignature(img);
            envoyerSignature(img);
            setShowSignature(false);
          }}
        />
      )}
    </div>
  );
};

export default DemandeAvancement;
