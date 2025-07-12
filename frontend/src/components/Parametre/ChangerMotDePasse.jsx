import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import "./ChangerMotDePasse.css";

const ChangerMotDePasse = () => {
  const [ancienMotDePasse, setAncienMotDePasse] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Fonction pour rafraîchir le token avec le refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("Refresh token introuvable, veuillez vous reconnecter.");
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/token/refresh/",
        { refresh: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccessToken = response.data.access;
      localStorage.setItem("access_token", newAccessToken);
      return newAccessToken;
    } catch (error) {
      throw new Error("Impossible de rafraîchir le token, veuillez vous reconnecter.");
    }
  };

  // Fonction pour changer le mot de passe (essaie avec token puis refresh si expiré)
  const changerMotDePasse = async (token) => {
    return axios.post(
      "http://localhost:8000/api/changer-mot-de-passe/",
      {
        ancien_mot_de_passe: ancienMotDePasse,
        nouveau_mot_de_passe: nouveauMotDePasse,
        confirmation: confirmation,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nouveauMotDePasse !== confirmation) {
      setTypeMessage("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    let token = localStorage.getItem("access_token");

    if (!token) {
      setTypeMessage("error");
      setMessage("Vous n'êtes pas connecté.");
      return;
    }

    try {
      // Essai avec token actuel
      const response = await changerMotDePasse(token);
      setTypeMessage("success");
      setMessage(response.data?.success || "Mot de passe changé avec succès !");
      setAncienMotDePasse("");
      setNouveauMotDePasse("");
      setConfirmation("");
    } catch (error) {
      // Si erreur 401, essayer de rafraîchir le token et réessayer
      if (error.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          const response = await changerMotDePasse(newToken);
          setTypeMessage("success");
          setMessage(response.data?.success || "Mot de passe changé avec succès !");
          setAncienMotDePasse("");
          setNouveauMotDePasse("");
          setConfirmation("");
        } catch (refreshError) {
          setTypeMessage("error");
          setMessage(refreshError.message);
        }
      } else {
        // Autres erreurs
        setTypeMessage("error");
        const errMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Erreur lors du changement de mot de passe.";
        setMessage(errMsg);
      }
    }
  };

 return (
  <div className="changer-container">
    <button
      onClick={() => navigate(-1)}
      className="close-button"
      aria-label="Retour"
    >
      <FaTimes />
    </button>

    <form onSubmit={handleSubmit}>
      <h2>Changer mon mot de passe</h2>
      <p className="description">
        Utilisez un mot de passe sécurisé contenant lettres, chiffres et
        caractères spéciaux.
      </p>

      {message && <div className={`message ${typeMessage}`}>{message}</div>}

      <label>Mot de passe actuel</label>
        <div className="password-input">
          <input
            type={showOldPassword ? "text" : "password"}
            value={ancienMotDePasse}
            onChange={(e) => setAncienMotDePasse(e.target.value)}
            required
          />
          <span className="eye-icon" onClick={() => setShowOldPassword(!showOldPassword)}>
            {showOldPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <label>Nouveau mot de passe</label>
        <div className="password-input">
          <input
            type={showNewPassword ? "text" : "password"}
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
          />
          <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <label>Confirmer le nouveau mot de passe</label>
        <div className="password-input">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
          />
          <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
      <button type="submit">Valider le changement</button>
    </form>
  </div>
);
};

export default ChangerMotDePasse;
