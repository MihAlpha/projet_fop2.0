import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import SignaturePad from '../../components/Signature/SignaturePad';

const LettreRenouvellement = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Renouvellement";
  const nom_dossier = "Lettre de renouvellement de contrat";
  const role = localStorage.getItem("role"); // ✅ Récupération du rôle

  // ✅ Charger la signature existante
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get_signature/?agent_id=${agent.id}&evenement=${type_evenement}&nom_dossier=${encodeURIComponent(nom_dossier)}`);
        const data = await response.json();

        if (response.ok && data.signature_image) {
          const imageData = data.signature_image.startsWith("data:")
            ? data.signature_image
            : `data:image/png;base64,${data.signature_image}`;
          setSignature(imageData);

          if (onSignatureValidee) {
            onSignatureValidee(); // ✅ Notifier le parent
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la signature :", error);
      }
    };

    if (agent && agent.id) {
      fetchSignature();
    }
  }, [agent]);

  // ✅ Enregistrer la signature
  const enregistrerSignature = async (signatureImage) => {
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
        if (onSignatureValidee) {
          onSignatureValidee();
        }
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
      position: 'relative',
      lineHeight: '1.8em'
    }}>
      {/* En-tête avec logo */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <img
          src={logo}
          alt="Logo Ministère"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Titre centré et souligné */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: '30px',
        textTransform: 'uppercase'
      }}>
        Lettre de renouvellement de contrat
      </h2>

      {/* Contenu de la lettre */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, agent administratif immatriculé(e) sous le numéro <strong>{agent.im}</strong>,
        accepte le renouvellement de mon contrat de travail au sein de l’administration publique.
      </p>

      <p>
        Ce renouvellement prend effet à compter de la date fixée par l’administration, conformément aux dispositions légales et réglementaires en vigueur.
      </p>

      <p>
        Je m’engage à poursuivre mes fonctions avec assiduité, loyauté, discipline et professionnalisme.
      </p>

      <p>
        Fait pour servir et valoir ce que de droit.
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
          role === "agent" && (
            <button onClick={() => setShowSignature(true)}>✍️ Signer</button>
          )
        )}

        <p style={{ marginTop: '10px' }}>{agent.nom} {agent.prenom}</p>
      </div>

      {/* SignaturePad */}
      {showSignature && (
        <SignaturePad
          nomPrenom={`${agent.nom} ${agent.prenom}`}
          onClose={() => setShowSignature(false)}
          onValidate={(img) => {
            setSignature(img);
            enregistrerSignature(img);
            setShowSignature(false);
          }}
        />
      )}
    </div>
  );
};

export default LettreRenouvellement;
