import React from "react";

const EventDetail = ({ event }) => {
  if (!event) {
    return (
      <div className="p-4 text-gray-500 italic">
        🔍 Cliquez sur un événement pour voir les détails ici.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-2">📄 Détail de l'événement</h2>
      <p><strong>Nom :</strong> {event.nom}</p>
      <p><strong>Type :</strong> {event.type}</p>
      <p><strong>Date :</strong> {event.date}</p>
      <h3 className="mt-4 font-medium">📁 Dossiers à fournir :</h3>
      <ul className="list-disc ml-6 mt-1">
        {event.dossiers.map((doc, index) => (
          <li key={index}>{doc}</li>
        ))}
      </ul>
    </div>
  );
};

export default EventDetail;
