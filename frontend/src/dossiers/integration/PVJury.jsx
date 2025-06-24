import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import SignaturePad from '../../components/SignaturePad';

const PVJury = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Intégration";
  const nom_dossier = "Procès verbal de jury";

  // ✅ Charger la signature depuis l’API
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

          // ✅ Notifier le parent si déjà signé
          if (onSignatureValidee) onSignatureValidee();
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la signature :", error);
      }
    };

    if (agent && agent.id) {
      fetchSignature();
    }
  }, [agent]);

  // ✅ Enregistrer la signature vers l’API
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
        if (onSignatureValidee) onSignatureValidee(); // ✅ notifier le parent
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
      {/* Logo en haut */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <img
          src={logo}
          alt="Logo Ministère"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Titre */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: '30px',
        textTransform: 'uppercase'
      }}>
        Procès-verbal de jury
      </h2>

      {/* Corps du texte */}
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

      {/* Signature agent */}
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

      {/* Boîte modale pour SignaturePad */}
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
