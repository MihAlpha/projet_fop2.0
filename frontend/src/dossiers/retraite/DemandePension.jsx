import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import { FaPenFancy } from 'react-icons/fa';
import SignaturePad from '../../components/Signature/SignaturePad';

const DemandePension = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Retraite";
  const nom_dossier = "Demande de pension de retraite";
  const role = localStorage.getItem("role"); // ✅ Récupération du rôle depuis le localStorage

  // 🔄 Charger la signature existante
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
          if (onSignatureValidee) {
            onSignatureValidee();
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la signature :", error);
      }
    };

    if (agent?.id) {
      fetchSignature();
    }
  }, [agent]);

  // 💾 Enregistrer la signature
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
          onSignatureValidee(); // ✅ Notifier le parent
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

      {/* Titre principal */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: '30px',
        textTransform: 'uppercase'
      }}>
        Demande de pension de retraite
      </h2>

      {/* Texte de la demande */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, immatriculé(e) sous le numéro <strong>{agent.im}</strong>, 
        ayant atteint l’âge légal de départ à la retraite et ayant accompli l’ensemble de ma carrière au sein de l’administration publique,
        sollicite par la présente le bénéfice de la pension de retraite à compter du <strong>{today}</strong>.
      </p>

      <p>
        Je m’engage à fournir tous les justificatifs requis pour le traitement de cette demande, notamment :
        le certificat de cessation de fonctions, les relevés de services, les bulletins de solde, ainsi que tout autre document exigé par l’organisme compétent.
      </p>

      <p>
        Je reste disponible pour toute information complémentaire et prie les autorités concernées de bien vouloir accorder une suite favorable à ma requête dans les meilleurs délais.
      </p>

      <p>
        Fait pour servir et valoir ce que de droit.
      </p>

      
      <div style={{
        marginTop: '180px',
        textAlign: 'right',
        width: '250px',
        float: 'right'
      }}>
        <p>Antananarivo, le {today}</p>

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

        <p style={{ marginTop: '10px' }}>{agent.nom} {agent.prenom}</p>
      </div>

      {/* Modale de signature */}
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

export default DemandePension;
