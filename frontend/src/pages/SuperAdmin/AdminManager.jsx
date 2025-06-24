import React, { useEffect, useState } from "react";
import axios from "axios";
import notifLogo from "./Alert.ico";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminManager.css";

const AdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
    fetchNotifications();
  }, []);

  const fetchAdmins = () => {
    axios.get("http://localhost:8000/api/admins/")
      .then(res => setAdmins(res.data))
      .catch(err => console.error("Erreur chargement admins :", err));
  };

  const fetchNotifications = () => {
    axios.get("http://localhost:8000/api/notifications/")
      .then(res => setNotifications(res.data))
      .catch(err => console.error("Erreur chargement notifications :", err));
  };

  const handleNotificationClick = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/notifications/${id}/read/`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );

      setTimeout(async () => {
        try {
          await axios.delete(`http://localhost:8000/api/notifications/${id}/`);
          setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
          console.error("Erreur suppression notification :", err);
        }
      }, 5000);
    } catch (err) {
      console.error("Erreur lecture notification :", err);
    }
  };

  const handleToggleActive = (id, currentStatus) => {
    axios.patch(`http://localhost:8000/api/admins/${id}/activate/`)
      .then(() => {
        setAdmins(prev =>
          prev.map(admin =>
            admin.id === id ? { ...admin, is_active: !currentStatus } : admin
          )
        );
        fetchNotifications();
      })
      .catch(err => console.error("Erreur modification statut :", err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet admin ?")) {
      axios.delete(`http://localhost:8000/api/admins/${id}/`)
        .then(() => setAdmins(prev => prev.filter(admin => admin.id !== id)))
        .catch(err => console.error("Erreur suppression :", err));
    }
  };

  const handleEdit = (admin) => {
    setEditAdmin(admin);
    setNewUsername(admin.username);
    setNewEmail(admin.email);
    setIsModalOpen(true);
  };

  const submitEdit = () => {
    const updatedData = {};
    if (newUsername && newUsername !== editAdmin.username) updatedData.username = newUsername;
    if (newEmail && newEmail !== editAdmin.email) updatedData.email = newEmail;

    if (Object.keys(updatedData).length === 0) {
      alert("Aucun changement détecté.");
      setIsModalOpen(false);
      return;
    }

    axios.patch(`http://localhost:8000/api/admins/${editAdmin.id}/`, updatedData)
      .then(() => {
        setAdmins(prev =>
          prev.map(admin =>
            admin.id === editAdmin.id ? { ...admin, ...updatedData } : admin
          )
        );
        alert("Modifications enregistrées !");
        setIsModalOpen(false);
      })
      .catch(err => {
        console.error("Erreur modification admin :", err);
        alert("Erreur lors de la modification.");
      });
  };

  return (
    <div className="admin-container">
      <div className="header-buttons">
        <button onClick={() => navigate(-1)} className="close-button" aria-label="Retour">
          <FaTimes />
        </button>

        <div
          className={`notif-icon ${showNotifications ? "active" : ""}`}
          onClick={() => setShowNotifications(true)}
        >
          <img src={notifLogo} alt="Notifications" />
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span className="notif-count">
              {notifications.filter(n => !n.is_read).length}
            </span>
          )}
        </div>

        {showNotifications && (
          <div
            onMouseLeave={() => setShowNotifications(false)}
            className="notif-dropdown"
          >
            <h4>Notifications</h4>
            <ul>
              {notifications.length === 0 ? (
                <li>Aucune notification</li>
              ) : (
                notifications.map(notif => (
                  <li
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    style={{
                      fontWeight: notif.is_read ? "normal" : "bold",
                      cursor: "pointer"
                    }}
                  >
                    <strong>{notif.title}</strong><br />
                    <span>{notif.message}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      <h2>Gestion des Utilisateurs</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Date de création</th>
            <th>Nom d’utilisateur</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(admin => (
            <tr key={admin.id}>
              <td>{new Date(admin.date_joined).toLocaleDateString()}</td>
              <td>{admin.username}</td>
              <td>{admin.email}</td>
              <td>{admin.is_active ? "Actif" : "Inactif"}</td>
              <td>
                <button className="admin-btn toggle-btn" onClick={() => handleToggleActive(admin.id, admin.is_active)}>
                  {admin.is_active ? "Désactiver" : "Activer"}
                </button>
                <button className="admin-btn edit-btn" onClick={() => handleEdit(admin)}>Modifier</button>
                <button className="admin-btn delete-btn" onClick={() => handleDelete(admin.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h3>Modifier l'utilisateur</h3>
            <label>
              Nom d'utilisateur :
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
              />
            </label>
            <label>
              Email :
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </label>
            <button onClick={submitEdit}>Enregistrer</button>
            <button onClick={() => setIsModalOpen(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManager;
