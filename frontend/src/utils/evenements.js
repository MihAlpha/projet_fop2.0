export function calculerEvenement(agent) {
    const aujourdHui = new Date();
    const dateEntree = new Date(agent.date_entree);
    const dateNaissance = new Date(agent.date_naissance);
  
    const differenceAnnees = (date1, date2) =>
      date1.getFullYear() - date2.getFullYear() -
      (date1.getMonth() < date2.getMonth() ||
      (date1.getMonth() === date2.getMonth() && date1.getDate() < date2.getDate()) ? 1 : 0);
  
    const age = differenceAnnees(aujourdHui, dateNaissance);
    const anciennete = differenceAnnees(aujourdHui, dateEntree);
  
    if (age >= 60) return "🧓 Retraite";
    if (anciennete >= 6) return "🎓 Intégration";
    if (anciennete >= 2) return "📈 Avancement";
  
    return "⏳ Aucun pour l’instant";
  }
  