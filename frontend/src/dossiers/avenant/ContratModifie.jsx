import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import SignaturePad from '../../components/SignaturePad';

const ContratModifie = ({ agent }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Avenant";
  const nom_dossier = "Contrat modifié";

  // ✅ Charger la signature depuis le backend
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

    if (agent && agent.id) {
      fetchSignature();
    }
  }, [agent]);

  // ✅ Envoi de la signature vers le backend
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

      {/* Titre */}
      <h2 style={{
        textAlign: 'center',
        textDecoration: 'underline',
        marginBottom: '30px',
        textTransform: 'uppercase'
      }}>
        Modification de contrat
      </h2>

      {/* Texte professionnel */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, agent administratif immatriculé sous le numéro <strong>{agent.im}</strong>,
        atteste avoir été informé(e) des modifications apportées à mon contrat de travail.
        Ces modifications prendront effet à compter, conformément aux dispositions mises en place par l’administration.
      </p>

      <p>
        Je reconnais avoir pris connaissance du contenu du présent contrat modifié et m’engage à en respecter toutes les clauses.
        Les changements portent notamment sur mes fonctions, mes responsabilités ou d’autres éléments contractuels, conformément à la législation en vigueur.
      </p>

      <p>
        Ce contrat modifié annule et remplace toutes les versions antérieures.
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

        {/* Zone de signature */}
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
            setSignature(img);         // Affiche localement
            envoyerSignature(img);     // Enregistre dans la base
            setShowSignature(false);   // Ferme la modale
          }}
        />
      )}
    </div>
  );
};

export default ContratModifie;
