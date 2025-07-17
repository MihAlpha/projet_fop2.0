from django.db import models
from agents.models import Agent

class Message(models.Model):
    
    expediteur = models.ForeignKey(
        Agent, on_delete=models.CASCADE, null=True, blank=True,
        related_name='messages_envoyes'
    )
    expediteur_role = models.CharField(max_length=50)

    # Agent qui reçoit (facultatif si c’est un rôle)
    destinataire = models.ForeignKey(
        Agent, on_delete=models.CASCADE, null=True, blank=True,
        related_name='messages_recus'
    )
    destinataire_role = models.CharField(max_length=50)

    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_envoi']

    def __str__(self):
        if self.destinataire:
            return f"{self.expediteur_role} → {self.destinataire.nom} : {self.contenu[:30]}"
        return f"{self.expediteur_role} → {self.destinataire_role} : {self.contenu[:30]}"
