import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import { FaPenFancy } from 'react-icons/fa';
import SignaturePad from '../../components/Signature/SignaturePad';

const LettreRenouvellement = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Renouvellement";
  const nom_dossier = "Lettre de renouvellement de contrat";
  const role = localStorage.getItem("role");

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
          if (onSignatureValidee) onSignatureValidee();
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la signature :", error);
      }
    };

    if (agent?.id) fetchSignature();
  }, [agent]);

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
        if (onSignatureValidee) onSignatureValidee();
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
      width: '500px',
      margin: '0 auto',
      padding: '10px 30px',
      backgroundColor: '#fff',
      color: '#111',
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      lineHeight: '1.4',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '12px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '20px' }}>
        <img
          src={logo}
          alt="Logo Ministère"
          style={{ width: '100%', height: '80px', objectFit: 'contain' }}
        />
      </div>

      {/* Titre */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        textTransform: 'uppercase',
        fontSize: '15px',
        marginBottom: '20px'
      }}>
        Lettre de renouvellement de contrat
      </h2>

      {/* Contenu */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, agent administratif immatriculé(e) sous le numéro <strong>{agent.im}</strong>,
        accepte le renouvellement de mon contrat de travail au sein de l’administration publique.
      </p>

      <p style={{ marginTop: '20px' }}>
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
        marginTop: '60px',
        textAlign: 'right'
      }}>
        <p style={{ fontSize: '12px', marginTop: '20px' }}>Antananarivo, le {today}</p>
        <p style={{ marginTop: '50px', fontSize: '12px' }}><strong>Signature de l’agent</strong></p>

        {signature ? (
          <img src={signature} alt="signature" style={{ width: '160px', height: '60px', objectFit: 'contain' }} />
        ) : (
          role === "agent" && (
            <button
              onClick={() => setShowSignature(true)}
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                backgroundColor: '#6C3483',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <FaPenFancy style={{ marginRight: '5px' }} />
              Signer
            </button>
          )
        )}

        <p style={{ marginTop: '10px', fontSize: '11px' }}>{agent.nom} {agent.prenom}</p>
      </div>

      {/* Zone SignaturePad */}
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
