import React from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center bg-blue-800 text-white px-4 py-3 shadow">
      <h1 className="text-2xl font-bold">Suivi des événements Automatiques</h1>

      <div className="flex items-center gap-6">
        {/* Icône notification */}
        <div className="relative cursor-pointer">
          <FaBell size={20} />
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
            3
          </span>
        </div>

        {/* Bouton de retour */}
        <button
          onClick={() => navigate(-1)}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Header;
