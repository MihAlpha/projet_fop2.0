// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import VoirIcon from './voir.png'; // Logo pour montrer le mot de passe
import NonIcon from './non.png'; // Logo pour cacher le mot de passe

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Données reçues après login :", data);

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));

        if (data.is_superuser === true) {
          navigate('/superadmin');
        } else {
          navigate('/admin');
        }
      } else {
        setError(data.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setError("Impossible de se connecter au serveur");
    }
  };

  return (
    <div>
      <div className="login-container">
        <h2>Connexion</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-container">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? NonIcon : VoirIcon}
              alt="Toggle visibility"
              className="toggle-password-icon"
              onClick={togglePasswordVisibility}
            />
          </div>

          <button type="submit">Se connecter</button>
        </form>

        <p className="extra-options">
          <Link to="/forgot-password" className={username ? '' : 'disabled-link'}>
            Mot de passe oublié ?
          </Link><br />
          <Link to="/register">Créer un compte</Link>
        </p>
      </div>

      <div className="button-container">
        <Link to="/" className="back-home-btn">Accueil ♥</Link>
      </div>
    </div>
  );
}

export default Login;
