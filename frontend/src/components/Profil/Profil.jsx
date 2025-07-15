import React, { useEffect, useState } from 'react';
import './Profil.css'; 
import defaultUser from './default-user.png';
import { FaCamera, FaTimes } from 'react-icons/fa';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

function Profil() {
  const [userData, setUserData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
  }, []);

  if (!userData) return <p>Chargement du profil...</p>;

  const photoUrl = photoPreview
    ? photoPreview
    : userData.photo_profil
    ? `http://localhost:8000${userData.photo_profil}`
    : defaultUser;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo_profil', file);

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/agents/${userData.id}/`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = { ...userData, photo_profil: response.data.photo_profil };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo:', error);
    }
  };

  return (
    <div className="profil-container">
      <h2>Mon Profil</h2>
         <button onClick={() => navigate(-1)} className="close-button" aria-label="Retour">
            <FaTimes />
         </button>
      
      <div className="profil-card">
        <div>
          <img src={photoUrl} alt="Profil" className="profil-photo" />
          <br />
          <label className="upload-btn">
            <FaCamera style={{ marginRight: '8px' }} />
            Modifier la photo
            <input type="file" accept="image/*" onChange={handleFileChange} hidden />
          </label>
        </div>
        <div className="profil-details">
          <p><strong>Nom d'utilisateur :</strong> {userData.username}</p>
          <p><strong>Email :</strong> {userData.email}</p>
          <p><strong>Rôle :</strong> {userData.is_superuser ? 'SuperAdmin' : 'Admin'}</p>
        </div>
      </div>
    </div>
  );
}

export default Profil;
