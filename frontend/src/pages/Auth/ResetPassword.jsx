// src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    const isVerified = localStorage.getItem('resetEmailVerified');

    if (savedEmail && isVerified === 'true') {
      setEmail(savedEmail);
    } else {
      // Si pas d'email ou pas vérifié => rediriger
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, new_password: newPassword, confirm_password: confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mot de passe réinitialisé avec succès.');
        // Nettoyer les données du localStorage
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('resetEmailVerified');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de serveur.');
    }
  };

  return (
    <div className="reset-password-container">
      <form className="reset-password-form" onSubmit={handleResetPassword}>
        <h2>Définir un nouveau mot de passe</h2>
        <p className="subtitle">Votre code a été validé. Choisissez un nouveau mot de passe sécurisé.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="input-group">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="reset-button">Réinitialiser le mot de passe</button>

        <p className="back-link" onClick={() => navigate('/login')}>
          ← Retour à la connexion
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
