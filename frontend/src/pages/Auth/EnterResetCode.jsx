import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './EnterResetCode.css';
import LogoMTEFOP from './MDP.png';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Code vérifié avec succès');
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
        headers: { 'Content-Type': 'application/json' },
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
    <div className="enter-code-wrapper">
      <div className="enter-code-card">
        <div className="enter-code-left">
          <img src={LogoMTEFOP} alt="Logo" className="enter-code-logo" />
          <h2 className="enter-code-title">MTEFoP</h2>
        </div>

        <div className="enter-code-right">
          <h2>Code de réinitialisation</h2>

          <input
            type="text"
            placeholder="Entrez le code reçu"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button onClick={handleVerify}>Valider le code</button>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <div className="extra-options">
            <a onClick={handleResendCode} style={{ cursor: 'pointer' }}>Code non reçu ?</a>
            <Link to="/forgot-password">Annuler</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterResetCode;
