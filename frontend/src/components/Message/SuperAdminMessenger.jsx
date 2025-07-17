import React, { useState, useEffect } from "react";
import AgentList from "./AgentList";

function SuperAdminMessenger() {
  const [agentIdSelectionne, setAgentIdSelectionne] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState("");

  const superAdminId = parseInt(localStorage.getItem("user_id"));

  // ✅ Récupération des messages entre SuperAdmin et Agent sélectionné
  useEffect(() => {
    if (!agentIdSelectionne || !superAdminId) return;

    const url = `http://localhost:8000/api/messages/conversation/?agent_id=${agentIdSelectionne}&superadmin_id=${superAdminId}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la récupération des messages");
        return res.json();
      })
      .then((data) => setMessages(data))
      .catch((error) => {
        console.error("Erreur récupération messages:", error);
        setMessages([]);
      });
  }, [agentIdSelectionne, superAdminId]);

  // ✅ Envoi d’un message SuperAdmin → Agent
  const envoyerMessage = () => {
    if (!nouveauMessage.trim() || !agentIdSelectionne) return;

    fetch("http://localhost:8000/api/messages/envoyer/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expediteur_id: superAdminId,
        expediteur_role: "SuperAdmin",
        destinataire_id: agentIdSelectionne,
        destinataire_role: "Agent",
        contenu: nouveauMessage,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de l'envoi");
        return res.json();
      })
      .then((message) => {
        setMessages((prev) => [...prev, message]);
        setNouveauMessage("");
      })
      .catch((err) => {
        console.error("Erreur envoi message:", err);
      });
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <AgentList
        onSelectAgent={setAgentIdSelectionne}
        agentSelectionne={agentIdSelectionne}
      />

      <div style={{ flex: 1 }}>
        {agentIdSelectionne ? (
          <>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                height: "300px",
                overflowY: "auto",
                marginBottom: "10px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign:
                      msg.expediteur_id === superAdminId &&
                      msg.expediteur_role === "SuperAdmin"
                        ? "right"
                        : "left",
                    margin: "5px 0",
                    backgroundColor:
                      msg.expediteur_id === superAdminId &&
                      msg.expediteur_role === "SuperAdmin"
                        ? "#dcf8c6"
                        : "#f1f0f0",
                    padding: "5px 10px",
                    borderRadius: "10px",
                    maxWidth: "70%",
                    marginLeft:
                      msg.expediteur_id === superAdminId &&
                      msg.expediteur_role === "SuperAdmin"
                        ? "auto"
                        : "initial",
                  }}
                >
                  <strong>
                    {msg.expediteur_role === "SuperAdmin" ? "SuperAdmin" : "Agent"} :
                  </strong>{" "}
                  {msg.contenu}
                </div>
              ))}
            </div>

            <textarea
              rows={3}
              value={nouveauMessage}
              onChange={(e) => setNouveauMessage(e.target.value)}
              placeholder="Écrire un message..."
              style={{ width: "100%" }}
            />
            <button onClick={envoyerMessage} disabled={!nouveauMessage.trim()}>
              Envoyer
            </button>
          </>
        ) : (
          <p>Sélectionne un agent pour commencer la conversation.</p>
        )}
      </div>
    </div>
  );
}

export default SuperAdminMessenger;
