import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserShield,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaKey,
  FaLandmark,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import "./SuperAdmin.css";

const SuperAdmin = () => {
  const [stats, setStats] = useState({});
  const [eventStatsByYear, setEventStatsByYear] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasUnreadAdminNotification, setHasUnreadAdminNotification] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openGestion, setOpenGestion] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/dashboard-stats/")
      .then((response) => {
        setStats({
          total_agents: response.data.total_agents,
          total_admins: response.data.total_admins,
          today_events: response.data.today_events,
          total_events: response.data.total_events,
        });

        // Normalisation des stats pour inclure tous les types
        const completeStats = response.data.event_stats_by_year.map((item) => ({
          year: item.year,
          Avenant: item.Avenant || 0,
          Renouvellement: item.Renouvellement || 0,
          Intégration: item.Intégration || 0,
          Avancement: item.Avancement || 0,
          Retraite: item.Retraite || 0,
        }));

console.log("TOUTES LES ANNÉES : ", response.data.event_stats_by_year.map(e => e.year));
console.log("Données brutes : ", response.data.event_stats_by_year);
const sample2025 = response.data.event_stats_by_year.find(
  (item) => item.year === 2025 || item.year === "2025"
);
console.log("Ce qu'il y a pour 2025 : ", sample2025);

        setEventStatsByYear(completeStats);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des statistiques :", error);
      });

    axios
      .get("http://localhost:8000/api/notifications/")
      .then((response) => {
        const unreadNotifications = response.data.filter((n) => !n.is_read);
        setNotificationCount(unreadNotifications.length);

        const alreadyVisited = localStorage.getItem("adminVisited");
        if (unreadNotifications.length > 0 && !alreadyVisited) {
          setHasUnreadAdminNotification(true);
        }
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des notifications :", error);
      });
  }, []);

  const handleAdminClick = () => {
    localStorage.setItem("adminVisited", "true");
    setHasUnreadAdminNotification(false);
  };

  const filteredEventStats = eventStatsByYear.filter(
    (item) => Number(item.year) === currentYear
  );

  return (
    <div className="superadmin-container">
      <aside className="sidebar">
        <ul>
          <li>
            <a href="/superadmin">
              <span className="icon-wrapper">
                <FaChartBar className="icon" />
              </span>
              <span className="link-text">Dashboard</span>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </a>
          </li>

          <li className="sidebar-link" onClick={() => setOpenGestion(!openGestion)}>
            <div className="link-wrapper">
              <span className="icon-wrapper">
                <FaUsers className="icon-1" />
              </span>
              <span className="link-text">Gestion</span>
              <span className="arrow">{openGestion ? "▲" : "▼"}</span>
            </div>
          </li>
            {openGestion && (
              <div className="submenu">
                <li>
                  <a href="/agents">
                    <span className="icon-wrapper">
                      <FaUsers className="icon" />
                    </span>
                    <span className="link-text">Agents</span>
                  </a>
                </li>
                <li>
                  <a href="/admins">
                    <span className="icon-wrapper">
                      <FaUserShield className="icon" />
                    </span>
                    <span className="link-text">Admins</span>
                  </a>
                </li>
              </div>
            )}

          <li>
            <a href="/evenements">
              <FaCalendarAlt className="icon" />
              <span className="link-text">Événements</span>
            </a>
          </li>
        </ul>

        <ul>
        <li className="sidebar-link" onClick={() => setOpenSettings(!openSettings)}>
          <div className="link-wrapper">
            <span className="icon-wrapper">
              <FaCog className="icon-1" />
            </span>
            <span className="link-text">Paramètres</span>
            <span className="arrow">{openSettings ? "▲" : "▼"}</span>
          </div>
        </li>
          {openSettings && (
            <div className="submenu">
              <li>
                <a href="/changer-mot-de-passe">
                  <span className="icon-wrapper">
                    <FaKey className="icon" />
                  </span>
                  <span className="link-text">Changer mot de passe</span>
                </a>
              </li>
              <li>
                <a href="/changer-logo">
                  <span className="icon-wrapper">
                    <FaLandmark className="icon" />
                  </span>
                  <span className="link-text">Modifier ministère</span>
                </a>
              </li>
            </div>
          )}

        </ul>
      </aside>

      <main className="dashboard-content">
        <h2>Tableau de bord - SuperAdmin</h2>

        <div className="stats-cards">
          <div className="card">
            <FaUsers className="card-icon" />
            <strong>Agents :</strong> <span>{stats.total_agents ?? "-"}</span>
          </div>
          <div className="card">
            <FaUserShield className="card-icon" />
            <strong>Admins :</strong> <span>{stats.total_admins ?? "-"}</span>
          </div>
          <div className="card">
            <FaCalendarAlt className="card-icon" />
            <strong>Événements du jour :</strong> <span>{stats.today_events ?? "-"}</span>
          </div>
          <div className="card">
            <FaChartBar className="card-icon" />
            <strong>Total Événements :</strong> <span>{stats.total_events ?? "-"}</span>
          </div>
        </div>

        <div className="chart-section">
          <h3>Prévision des événements pour l’année {currentYear}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredEventStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend
                payload={[
                  { value: "Avenant", type: "square", color: "#3b82f6" },
                  { value: "Renouvellement", type: "square", color: "#f59e0b" },
                  { value: "Intégration", type: "square", color: "#ef4444" },
                  { value: "Avancement", type: "square", color: "#14b8a6" },
                  { value: "Retraite", type: "square", color: "#22c55e" },
                ]}
              />
              <Bar dataKey="Avenant" fill="#3b82f6" name="Avenant" />
              <Bar dataKey="Renouvellement" fill="#f59e0b" name="Renouvellement" />
              <Bar dataKey="Intégration" fill="#ef4444" name="Intégration" />
              <Bar dataKey="Avancement" fill="#14b8a6" name="Avancement" />
              <Bar dataKey="Retraite" fill="#22c55e" name="Retraite" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default SuperAdmin;