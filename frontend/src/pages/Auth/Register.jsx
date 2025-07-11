// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import LogoMTEFOP from './mtefp_logo.jpg';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }

      alert("Compte créé avec succès !");
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        {/* Partie gauche avec logo */}
        <div className="register-left">
          <img src={LogoMTEFOP} alt="Logo MTEFOP" className="register-logo" />
          <h2 className="register-title">Inscription</h2>
        </div>

        {/* Partie droite avec formulaire */}
        <div className="register-right">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">S'inscrire</button>
          </form>

          <p className="login-link">
            Déjà un compte ?
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
