import React from "react";

const SidebarRight = () => {
  return (
    <div className="w-full max-w-xs p-4 bg-gray-100 rounded shadow space-y-6">
      {/* Filtres */}
      <div>
        <h3 className="text-lg font-bold mb-2">🔍 Filtres</h3>
        <select className="w-full p-2 rounded border">
          <option>Tous les événements</option>
          <option>Avenant</option>
          <option>Renouvellement</option>
          <option>Intégration</option>
          <option>Avancement</option>
          <option>Retraite</option>
        </select>
      </div>

      {/* Historique */}
      <div>
        <h3 className="text-lg font-bold mb-2">📜 Historique</h3>
        <ul className="text-sm space-y-1">
          <li>✔️ Rakoto Jean – Retraite (13/05/2025)</li>
          <li>✔️ Rasoa Marie – Avenant (01/04/2025)</li>
        </ul>
      </div>

      {/* Résumé */}
      <div>
        <h3 className="text-lg font-bold mb-2">📊 Résumé global</h3>
        <ul className="text-sm space-y-1">
          <li>👥 Agents total : 128</li>
          <li>📅 Événements ce mois : 12</li>
          <li>🔔 Aujourd'hui : 3 événements</li>
          <li>🕓 Prochains 7 jours : 4 événements</li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarRight;
