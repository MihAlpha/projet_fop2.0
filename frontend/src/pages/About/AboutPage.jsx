import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>À propos du Ministère</h1>

        <section className="presentation">
          <h2>Présentation du Ministère</h2>
          <p>
            Le Ministère de la Fonction Publique, du Travail et des Lois Sociales joue un rôle crucial dans la gestion
            administrative et la régulation des carrières des fonctionnaires à Madagascar.
          </p>

          <h3>Historique</h3>
          <p>
            Depuis les années 1990, ce ministère est engagé dans la modernisation de la fonction publique en intégrant les TIC.
          </p>

          <h3>Organisation Générale</h3>
          <p>
            Organisé selon le décret n°2011-687, il est chargé du suivi de la politique publique en matière de travail, lois sociales
            et administration de la fonction publique.
          </p>
        </section>

        <section className="contact-section">
          <h2>Contact</h2>
          <div className="contact-item"><FaMapMarkerAlt /> 67 Ha Avaratra Antananarivo, Madagascar</div>
          <div className="contact-item"><FaPhone /> +261 34 00 000 00</div>
          <div className="contact-item"><FaEnvelope /> contact@fonctionpublique.gov.mg</div>
        </section>

        
      </div>
      <div className="button-container">
      <Link to="/" className="back-home-btn">Accueil ♥</Link>
      </div>
    </div>
  );
};

export default AboutPage;
