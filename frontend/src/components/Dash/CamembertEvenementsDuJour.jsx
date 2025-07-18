import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// Couleurs personnalisées pour les types d'événements
const colors = {
  Avenant: "#7f5af0",        // violet
  Renouvellement: "#faae7b", // orange
  Intégration: "#5d3a1a",    // marron
  Avancement: "#14b8a6",     // vert-bleu doux
  Retraite: "#22c55e",       // vert clair
};

const CamembertEvenementsDuJour = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/statistiques-evenements-du-jour/")
      .then((res) => res.json())
      .then((json) => {
        const chartData = Object.entries(json).map(([type, count]) => ({
          name: type,
          value: count,
        }));
        setData(chartData);
      })
      .catch((err) => console.error("Erreur fetch:", err));
  }, []);

  return (
    <div style={{
      width: "100%",
      maxWidth: "500px",
      margin: "0 auto",
      padding: "20px",
      backgroundColor: "#fffdf9",
      borderRadius: "16px",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)"
    }}>
      <h3 style={{
        textAlign: "center",
        marginBottom: "1rem",
        color: "#7f5af0",
        fontSize: "18px"
      }}>
        📊 Répartition des événements du jour
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[entry.name] || "#ccc"}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} événement(s)`, name]}
            contentStyle={{ backgroundColor: "#fffdf9", borderRadius: "8px", border: "1px solid #ccc" }}
            labelStyle={{ color: "#5d3a1a" }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "13px",
              marginTop: "12px",
              color: "#5d3a1a",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CamembertEvenementsDuJour;
