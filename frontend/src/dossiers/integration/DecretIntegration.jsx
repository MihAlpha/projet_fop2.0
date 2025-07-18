import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import { FaPenFancy } from 'react-icons/fa';
import SignaturePad from '../../components/Signature/SignaturePad';

const DecretIntegration = ({ agent }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Intégration";
  const nom_dossier = "Décret d’intégration";
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
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la signature :", error);
      }
    };

    if (agent?.id) fetchSignature();
  }, [agent]);

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
      {/* En-tête */}
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
        Décret d’intégration
      </h2>

      {/* Corps */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, immatriculé(e) sous le numéro <strong>{agent.im}</strong>,
        atteste avoir reçu le présent décret portant intégration dans la Fonction Publique.
      </p>

      <p>
        Cette intégration est prononcée conformément aux dispositions réglementaires en vigueur au sein de l’administration.
        Elle prend effet à compter de la date mentionnée sur l’acte officiel transmis par les autorités compétentes.
      </p>

      <p>
        Par la présente, je m’engage à respecter les obligations statutaires et à exercer mes fonctions avec rigueur,
        intégrité et loyauté.
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

      {/* Modale Signature */}
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

export default DecretIntegration;
