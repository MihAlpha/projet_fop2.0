import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import { FaPenFancy } from 'react-icons/fa';
import SignaturePad from '../../components/Signature/SignaturePad';

const PVJury = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Intégration";
  const nom_dossier = "Procès verbal de jury";
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

          if (onSignatureValidee) onSignatureValidee(); // ✅ Notifier si déjà signé
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
        Procès-verbal de jury
      </h2>

      {/* Contenu */}
      <p>
        Le jury de sélection, réuni conformément aux textes régissant la Fonction Publique, atteste que :
      </p>

      <p style={{ marginTop: '20px' }}>
        <strong>Nom de l’agent :</strong> {agent.nom} {agent.prenom}<br />
        <strong>Matricule (IM) :</strong> {agent.im}
      </p>

      <p style={{ marginTop: '20px' }}>
        a satisfait aux critères requis pour son intégration au sein de l’administration publique.
      </p>

      <p>
        Après étude de son dossier et évaluation de ses compétences, le jury a émis un avis favorable à l’unanimité.
      </p>

      <p>
        Le présent procès-verbal est établi pour servir et valoir ce que de droit.
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

      {/* SignaturePad Modal */}
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

export default PVJury;
