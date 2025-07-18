import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import { FaPenFancy } from 'react-icons/fa';
import SignaturePad from '../../components/Signature/SignaturePad';

const CertificatCessation = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Retraite";
  const nom_dossier = "Certificat de cessation de fonctions";
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
        console.error("Erreur de chargement de la signature :", error);
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
        Certificat de cessation de fonctions
      </h2>

      {/* Contenu du texte */}
      <p>
        Nous certifions que <strong>{agent.nom} {agent.prenom}</strong>, agent administratif immatriculé sous le numéro <strong>{agent.im}</strong>,
        a mis fin à ses fonctions au sein de l’administration publique à compter du <strong>{today}</strong>.
      </p>

      <p style={{ marginTop: '20px' }}>
        Tout au long de sa carrière, l'intéressé(e) a fait preuve de rigueur, de loyauté et d’un engagement constant envers le service public.
        Cette cessation est conforme aux dispositions du Statut Général de la Fonction Publique.
      </p>

      <p>
        <strong>Le présent certificat est délivré pour servir et faire valoir ce que de droit, notamment dans le cadre de l’ouverture des droits à la retraite.</strong>
      </p>

      {/* Signature autorité */}
      <div style={{
        marginTop: '60px',
        textAlign: 'right'
      }}>
        <p style={{ fontSize: '12px', marginTop: '20px' }}>Antananarivo, le {today}</p>
        <p style={{ marginTop: '50px', fontSize: '12px' }}><strong>Signature de l’autorité compétente</strong></p>

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

        <p style={{ marginTop: '10px', fontSize: '11px' }}>Le Responsable Administratif</p>
      </div>

      {/* SignaturePad */}
      {showSignature && (
        <SignaturePad
          nomPrenom="Le Responsable Administratif"
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

export default CertificatCessation;
