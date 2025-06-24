import React, { useRef, useState, useEffect } from "react";
import { FaTimes, FaPrint, FaDownload, FaEnvelope } from "react-icons/fa";
import html2pdf from "html2pdf.js";

import ContratModifie from "../../../dossiers/avenant/ContratModifie";
import LettreAffectation from "../../../dossiers/avenant/LettreAffectation";
import AttestationDePerformance from "../../../dossiers/avancement/AttestationDePerformance";
import DemandeAvancement from "../../../dossiers/avancement/DemandeAvancement";
import DecretIntegration from "../../../dossiers/integration/DecretIntegration";
import PVJury from "../../../dossiers/integration/PVJury";
import LettreRenouvellement from "../../../dossiers/renouvellement/LettreRenouvellement";
import EngagementAdministration from "../../../dossiers/renouvellement/EngagementAdministration";
import CertificatCessation from "../../../dossiers/retraite/CertificatCessation";
import DemandePension from "../../../dossiers/retraite/DemandePension";

import "./Dossier.css";

// Fonction de normalisation similaire à celle du backend
const normalizeNomDossier = (nom) => {
  if (!nom) return "";
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime accents
    .replace(/\s+/g, "_")            // remplace espaces par _
    .trim();
};

const Dossier = ({ nomDossier, agent, typeEvenement, onClose }) => {
  const contentRef = useRef();
  const [signatureExiste, setSignatureExiste] = useState(null); // null = en cours de vérification

  useEffect(() => {
    const verifierSignature = async () => {
      try {
        const nomDossierNormalise = normalizeNomDossier(nomDossier);
        const response = await fetch(
          `http://localhost:8000/api/verifier-signature/?agent_id=${agent.id}&evenement=${typeEvenement}&nom_dossier=${nomDossierNormalise}`
        );
        const data = await response.json();
        console.log("Résultat vérification signature :", data);
        setSignatureExiste(data.signature_existe);
      } catch (error) {
        console.error("Erreur vérification signature:", error);
        setSignatureExiste(false);
      }
    };
    verifierSignature();
  }, [agent.id, typeEvenement, nomDossier]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = contentRef.current.cloneNode(true);
    const opt = {
      margin: [1, 1, 1, 1],
      filename: `${agent.nom}_${agent.prenom}_${nomDossier}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1 },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  };

  const envoyerEmail = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/envoyer-email-signature/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agent.id,
          type_evenement: typeEvenement,
          nom_dossier: nomDossier,
        }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Erreur envoi email :", error);
      alert("Erreur lors de l'envoi de l'e-mail.");
    }
  };

  // Fonction appelée par le composant enfant après signature
  const handleSignatureValidee = () => {
    setSignatureExiste(true);
  };

  return (
    <div className="dossier-overlay">
      <div className="dossier-wrapper">
        <div className="dossier-actions no-print">
          <button className="btn-print" onClick={handlePrint}>
            <FaPrint /> Imprimer
          </button>
          <button className="btn-download" onClick={handleDownloadPDF}>
            <FaDownload /> Télécharger
          </button>

          {signatureExiste === false && (
            <button className="btn-email" onClick={envoyerEmail}>
              <FaEnvelope /> Envoyer un e-mail à l’agent
            </button>
          )}

          <button className="btn-close" onClick={onClose}>
            <FaTimes /> Fermer
          </button>
        </div>

        <div className="dossier-content printable" ref={contentRef}>
          {nomDossier === "Contrat modifié" && (
            <ContratModifie agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Lettre d'affectation" && (
            <LettreAffectation agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Attestation de performance" && (
            <AttestationDePerformance agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Demande d’avancement" && (
            <DemandeAvancement agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Décret d’intégration" && (
            <DecretIntegration agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "PV de jury" && (
            <PVJury agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Lettre de renouvellement" && (
            <LettreRenouvellement agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Lettre d’engagement de l’administration" && (
            <EngagementAdministration agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Certificat de cessation" && (
            <CertificatCessation agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
          {nomDossier === "Demande de pension" && (
            <DemandePension agent={agent} onSignatureValidee={handleSignatureValidee} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dossier;
