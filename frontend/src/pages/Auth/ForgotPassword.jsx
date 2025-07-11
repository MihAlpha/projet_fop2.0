import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import LogoMTEFOP from './MDP.png'; // ✅ logo importé

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('resetEmail', email);
        navigate('/enter-code');
      } else {
        setError(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError('Erreur lors de la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <div className="forgot-left">
          <img src={LogoMTEFOP} alt="Logo" className="forgot-logo" />
          <h2 className="forgot-title">MTEFoP</h2>
        </div>

        <div className="forgot-right">
          <h2>Mot de passe oublié ?</h2>

          {loading && <p>Envoi du code en cours...</p>}
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyer le code'}
            </button>
          </form>

          <p className="extra-options">
            <Link to="/login">Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
