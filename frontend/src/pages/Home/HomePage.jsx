// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import logo from './mtefp_logo.jpg'; // Assure-toi que ce chemin est correct

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Barre de navigation */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-placeholder">
            <img src={logo} alt="Logo ministère" className="logo-image" />
          </div>
          <div className="navbar-title">
            Ministère de la Fonction Publique, du Travail et des Lois Sociales
          </div>
        </div>
        <div className="navbar-links">
          <Link to="/about" className="btn">À propos</Link>
          <Link to="/login" className="btn">Se connecter</Link>
          <Link to="/agents" className="btn">Base de données</Link>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="content">
        
        <h2>
          Bienvenue sur la plateforme dédiée à la gestion intelligente et automatisée des carrières dans la fonction publique.
        </h2>
      </div>
    </div>
  );
};

export default HomePage;
