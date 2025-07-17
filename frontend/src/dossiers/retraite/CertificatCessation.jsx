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
  const role = localStorage.getItem("role"); // ✅ Récupération du rôle

  // ✅ Charger la signature existante depuis l’API
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
        console.error("Erreur de chargement de la signature :", error);
      }
    };

    if (agent?.id) {
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
      lineHeight: '1.8em',
      position: 'relative'
    }}>
      {/* Logo en-tête */}
      <div style={{ width: '100%', marginBottom: '20px' }}>
        <img
          src={logo}
          alt="Logo Ministère"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Titre centré, souligné */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: '30px',
        textTransform: 'uppercase'
      }}>
        Certificat de cessation de fonctions
      </h2>

      {/* Corps du texte */}
      <p>
        Nous certifions que <strong>{agent.nom} {agent.prenom}</strong>, agent administratif immatriculé sous le numéro <strong>{agent.im}</strong>,
        a mis fin à ses fonctions au sein de l’administration publique à compter du <strong>{today}</strong>.
      </p>

      <p>
        Tout au long de sa carrière, l'intéressé(e) a fait preuve de rigueur, de loyauté et d’un engagement constant envers le service public.
        Cette cessation est conforme aux dispositions du Statut Général de la Fonction Publique.
      </p>

      <p>
        <strong>Le présent certificat est délivré pour servir et faire valoir ce que de droit, notamment dans le cadre de l’ouverture des droits à la retraite.</strong>
      </p>

      {/* Signature autorité */}
      <div style={{
        marginTop: '180px',
        textAlign: 'right',
        width: '250px',
        float: 'right'
      }}>
        <p>Antananarivo, le {today}</p>
        <p style={{ marginTop: '60px' }}><strong>Signature de l’autorité compétente</strong></p>

        {signature ? (
          <img src={signature} alt="signature" style={{ width: '100%', height: '80px', objectFit: 'contain' }} />
        ) : (
          role === "agent" && (
            <button onClick={() => setShowSignature(true)}>
              <FaPenFancy style={{ marginRight: '5px' }} />
              Signer
            </button>

          )
        )}

        <p style={{ marginTop: '10px' }}>Le Responsable Administratif</p>
      </div>

      {/* Composant SignaturePad */}
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
