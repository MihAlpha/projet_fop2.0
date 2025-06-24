from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Agent, Evenement

@receiver(post_save, sender=Agent)
def create_evenements_for_agent(sender, instance, created, **kwargs):
    print(f"[SIGNAL] post_save appelé pour Agent {instance} - created = {created}")
    if not created:
        print("[SIGNAL] Ce n'est pas une création, on quitte.")
        return

    date_debut = instance.date_debut
    date_naissance = instance.date_naissance

    if not date_debut or not date_naissance:
        print("[SIGNAL] date_debut ou date_naissance manquant, on quitte.")
        return

    annee_retraite = date_naissance.year + 60

    evenements_logiques = [
        ('Avenant', 1),
        ('Renouvellement', 2),
        ('Avenant', 3),
        ('Renouvellement', 4),
        ('Avenant', 5),
        ('Intégration', 6),
    ]

    for type_evenement, annee_offset in evenements_logiques:
        try:
            date_event = date_debut.replace(year=date_debut.year + annee_offset)
        except ValueError:
            date_event = date_debut.replace(year=date_debut.year + annee_offset, day=28)
        try:
            Evenement.objects.create(
                agent=instance,
                type_evenement=type_evenement,
                date=date_event,
                dossiers_a_fournir=f"Dossier pour {type_evenement}"
            )
            print(f"[SIGNAL] Création événement '{type_evenement}' le {date_event} pour l'agent {instance.im}")
        except Exception as e:
            print(f"[SIGNAL] Erreur création événement {type_evenement} pour agent {instance.im}: {e}")

    annee_avancement = date_debut.year + 7
    while annee_avancement < annee_retraite:
        try:
            date_event = date_debut.replace(year=annee_avancement)
        except ValueError:
            date_event = date_debut.replace(year=annee_avancement, day=28)
        try:
            Evenement.objects.create(
                agent=instance,
                type_evenement='Avancement',
                date=date_event,
                dossiers_a_fournir="Dossier pour Avancement"
            )
            print(f"[SIGNAL] Création événement 'Avancement' le {date_event} pour l'agent {instance.im}")
        except Exception as e:
            print(f"[SIGNAL] Erreur création événement Avancement pour agent {instance.im}: {e}")
        annee_avancement += 2

    try:
        date_retraite = date_naissance.replace(year=annee_retraite)
    except ValueError:
        date_retraite = date_naissance.replace(year=annee_retraite, day=28)

    try:
        Evenement.objects.create(
            agent=instance,
            type_evenement='Retraite',
            date=date_retraite,
            dossiers_a_fournir="Dossier pour Retraite"
        )
        print(f"[SIGNAL] Création événement 'Retraite' le {date_retraite} pour l'agent {instance.im}")
    except Exception as e:
        print(f"[SIGNAL] Erreur création événement Retraite pour agent {instance.im}: {e}")
