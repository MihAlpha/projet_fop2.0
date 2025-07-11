import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import VoirIcon from './voir.png';
import NonIcon from './non.png';
import LogoMTEFOP from './mtefp_logo.jpg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        navigate(data.is_superuser ? '/superadmin' : '/admin');
      } else {
        setError(data.error || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setError("Impossible de se connecter au serveur");
    }
  };

  return (
    <div className="login-wrapper-formel">
      <div className="login-card">
        <div className="login-left">
          <img src={LogoMTEFOP} alt="Logo MTEFoP" className="login-logo" />
          <h2 className="login-title">Connexion</h2>
        </div>

        <div className="login-right">
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
                alt="Afficher/Cacher"
                className="toggle-password-icon"
                onClick={togglePasswordVisibility}
              />
            </div>

            <button type="submit">Se connecter</button>
          </form>

          <div className="extra-options">
            <Link to="/forgot-password" className={username ? '' : 'disabled-link'}>
              Mot de passe oublié ?
            </Link>
            <br />
            <Link to="/register">Créer un compte</Link>
          </div>
        </div>
      </div>

      {/* Bouton Annuler hors du bloc */}
      <div className="cancel-button-container">
        <Link to="/" className="cancel-button">Accueil ♥</Link>
      </div>
    </div>
  );
}

export default Login;
