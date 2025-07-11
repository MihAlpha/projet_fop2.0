import React, { useState, useEffect } from 'react';
import logo from '../img_tête.png';
import SignaturePad from '../../components/SignaturePad';

const AttestationDePerformance = ({ agent, onSignatureValidee }) => {
  const today = new Date().toLocaleDateString('fr-FR');
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  const type_evenement = "Avancement";
  const nom_dossier = "Attestation de performance";

  const role = localStorage.getItem("role"); // 👈 Récupère le rôle ici

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
        console.error("Erreur lors du chargement de la signature :", error);
      }
    };

    if (agent && agent.id) {
      fetchSignature();
    }
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
        Attestation de performance
      </h2>

      {/* Texte */}
      <p>
        Je soussigné(e), <strong>{agent.nom} {agent.prenom}</strong>, agent administratif immatriculé sous le numéro <strong>{agent.im}</strong>,
        atteste par la présente avoir accompli mes fonctions avec assiduité, professionnalisme et engagement constant dans l’exercice de mes responsabilités.
      </p>

      <p>
        Durant la période écoulée, j’ai démontré un respect rigoureux des délais, une implication active dans la réalisation des tâches confiées,
        ainsi qu’une contribution significative au bon fonctionnement de l’administration publique.
      </p>

      <p>
        Cette attestation est rédigée en vue d’appuyer une demande d’avancement dans le cadre des dispositions en vigueur relatives à la carrière des agents de l’État.
      </p>

      <p>
        Fait pour servir et valoir ce que de droit.
      </p>

      {/* Bloc Signature */}
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

export default AttestationDePerformance;
