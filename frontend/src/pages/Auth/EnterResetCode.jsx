// src/components/EnterResetCode.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EnterResetCode.css';

const EnterResetCode = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setError("Aucun email trouvé. Veuillez recommencer.");
      navigate('/forgot-password');
    }
  }, [navigate]);

  const handleVerify = async () => {
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/verify-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Code vérifié avec succès');
        // Enregistre dans localStorage que l'email est validé
        localStorage.setItem('resetEmailVerified', 'true');
        navigate('/reset-password');
      } else {
        setError(data.message || 'Code incorrect ou expiré.');
      }
    } catch (err) {
      setError("Erreur lors de la vérification du code.");
    }
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/resend-reset-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Code renvoyé avec succès !");
      } else {
        setError(data.message || "Erreur lors de l'envoi du code.");
      }
    } catch (err) {
      setError("Erreur réseau. Réessayez plus tard.");
    }
  };

  return (
    <div className="enter-code-container">
      <h2>Entrez le code de réinitialisation</h2>

      <input
        type="text"
        placeholder="Code de réinitialisation"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleVerify}>Valider le code</button>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="extra-options">
        <a onClick={handleResendCode} className="resend-link" style={{ cursor: 'pointer' }}>
          Code non reçu ?
        </a>
        <Link to="/forgot-password" className="cancel-link">Annuler</Link>
      </div>
    </div>
  );
};

export default EnterResetCode;
