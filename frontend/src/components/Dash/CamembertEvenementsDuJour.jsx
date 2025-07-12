import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const colors = {
  Avenant: "#3b82f6",
  Renouvellement: "#f59e0b",
  Intégration: "#ef4444",
  Avancement: "#14b8a6",
  Retraite: "#22c55e",
};

const CamembertEvenementsDuJour = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/statistiques-evenements-du-jour/")
      .then((res) => res.json())
      .then((json) => {
        // Transformer les données pour recharts
        const chartData = Object.entries(json).map(([type, count]) => ({
          name: type,
          value: count,
        }));
        setData(chartData);
      })
      .catch((err) => console.error("Erreur fetch:", err));
  }, []);

  return (
    <div style={{ width: "100%", height: 250 }}>
      <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        Répartition des événements du jour
      </h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[entry.name] || "#ccc"}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} événement(s)`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CamembertEvenementsDuJour;
