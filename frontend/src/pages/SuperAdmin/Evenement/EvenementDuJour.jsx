import React from "react";

const EvenementDuJour = ({ type, evenements, onSelect }) => {
  return (
    <div className="bg-white rounded shadow p-4 w-full max-w-5xl">
      <h2 className="text-lg font-bold text-blue-600 mb-3">{type}</h2>
      {evenements.length === 0 ? (
        <p className="text-gray-500 italic">Aucun événement aujourd’hui.</p>
      ) : (
        <ul className="space-y-2">
          {evenements.map((e, index) => (
            <li
              key={index}
              onClick={() => onSelect(e)}
              className="cursor-pointer hover:bg-blue-100 p-2 rounded"
            >
              {e.nom} a un(e) {e.type} aujourd’hui.
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EvenementDuJour;
