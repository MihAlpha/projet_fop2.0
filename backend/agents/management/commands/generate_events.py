from django.core.management.base import BaseCommand
from agents.models import Agent, Evenement
from datetime import date
from dateutil.relativedelta import relativedelta

# 📁 Documents requis par type d'événement
documents_par_type = {
    "Avenant": ["Contrat modifié", "Lettre d'affectation"],
    "Renouvellement": ["Lettre de renouvellement", "Lettre d’engagement de l’administration"],
    "Intégration": ["Décret d’intégration", "PV de jury"],
    "Avancement": ["Attestation de performance", "Demande d’avancement"],
    "Retraite": ["Certificat de cessation", "Demande de pension"],
}

class Command(BaseCommand):
    help = "Génère automatiquement les événements pour chaque agent"

    def handle(self, *args, **kwargs):
        agents = Agent.objects.all()
        created_count = 0

        for agent in agents:
            if not agent.date_debut or not agent.date_naissance:
                continue

            # Supprimer les anciens événements de cet agent
            Evenement.objects.filter(agent=agent).delete()

            calendrier = []
            date_base = agent.date_debut
            naissance = agent.date_naissance
            retraite_date = naissance.replace(year=naissance.year + 60)

            # === CAS 1 : E, ELD, EFA depuis le début ===
            if agent.qualite in ['E', 'ELD', 'EFA'] and agent.qualite_initiale in ['E', 'ELD', 'EFA']:
                calendrier.append(("Recrutement", date_base))
                for i in range(1, 6):
                    evt = "Avenant" if i % 2 != 0 else "Renouvellement"
                    calendrier.append((evt, date_base + relativedelta(years=i)))
                integration = date_base + relativedelta(years=6)
                calendrier.append(("Intégration", integration))
                avancement = integration + relativedelta(years=1)
                while avancement < retraite_date:
                    calendrier.append(("Avancement", avancement))
                    avancement += relativedelta(years=2)

            # === CAS 2 : Erreur corrigée (E → F) ===
            elif agent.qualite == "Fonctionnaire" and agent.qualite_initiale in ['E', 'ELD', 'EFA']:
                integration = date_base
                calendrier.append(("Intégration", integration))
                avancement = integration + relativedelta(years=1)
                while avancement < retraite_date:
                    calendrier.append(("Avancement", avancement))
                    avancement += relativedelta(years=2)

            # === CAS 3 : Erreur corrigée (F → E) ===
            elif agent.qualite in ['E', 'ELD', 'EFA'] and agent.qualite_initiale == "Fonctionnaire":
                calendrier.append(("Recrutement", date_base))
                for i in range(1, 6):
                    evt = "Avenant" if i % 2 != 0 else "Renouvellement"
                    calendrier.append((evt, date_base + relativedelta(years=i)))
                integration = date_base + relativedelta(years=6)
                calendrier.append(("Intégration", integration))
                avancement = integration + relativedelta(years=1)
                while avancement < retraite_date:
                    calendrier.append(("Avancement", avancement))
                    avancement += relativedelta(years=2)

            # === CAS 4 : Fonctionnaire depuis le début ===
            elif agent.qualite == "Fonctionnaire":
                integration = date_base
                calendrier.append(("Intégration", integration))
                avancement = integration + relativedelta(years=1)
                while avancement < retraite_date:
                    calendrier.append(("Avancement", avancement))
                    avancement += relativedelta(years=2)

            # Ajouter Retraite
            calendrier.append(("Retraite", retraite_date))

            # Création des événements
            for type_evt, date_evt in calendrier:
                _, created = Evenement.objects.get_or_create(
                    agent=agent,
                    type_evenement=type_evt,
                    date=date_evt,
                    defaults={
                        "dossiers_a_fournir": "\n".join(documents_par_type.get(type_evt, []))
                    }
                )
                if created:
                    created_count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ {created_count} événements générés pour tous les agents (passé et futur)."))
