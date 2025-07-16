from django.contrib.auth.models import User
from django.db import models

# ====== RESET CODE ======
class ResetCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Code pour {self.user.username}: {self.code}"

# ====== AGENT ======
class Agent(models.Model):
    QUALITE_CHOICES = [
        ('EFA', 'EFA'),
        ('ELD', 'ELD'),
        ('E', 'E'),
        ('Fonctionnaire', 'Fonctionnaire'),
    ]
    DIRECTIONS = [
        ('DPSSE', 'Direction de la Planification Stratégique du Suivi et Evaluation'),
        ('DIR.COM', 'Direction de la Communication'),
        ('DRHM', 'Direction des Ressources Humaines du Minisatère'),
        ('DRTEFOP', 'Direction Régionales du Travail de l Emploi et de la Fonction Publique'),
        ('DSI', 'Direction du Système d Information'),
        ('DGT', 'Direction Générale du Travail'),
        ('DTPDF', 'Direction du Travail et de la Promotion des Droits fondamentaux'),
        ('DMP', 'Direction de la Migration Professionnelle'),
        ('DSST', 'Direction de la Sécurité Sociale des Travailleurs'),
        ('DGPE', 'Direction Générale de la Promotion de l Emploi'),
    ]

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    sexe = models.CharField(max_length=10, choices=[('Homme', 'Homme'), ('Femme', 'Femme')], default=' ')
    im = models.CharField(max_length=6, unique=True)
    cin = models.CharField(max_length=12, unique=True)
    date_naissance = models.DateField()
    date_debut = models.DateField()
    diplome = models.CharField(max_length=100)
    direction = models.CharField(max_length=100, choices=DIRECTIONS, default=' ')
    service = models.CharField(max_length=100)
    corps = models.CharField(max_length=100)
    grade = models.CharField(max_length=100)
    qualite = models.CharField(max_length=20, choices=QUALITE_CHOICES, default=' ')
    qualite_initiale = models.CharField(max_length=20, choices=QUALITE_CHOICES, blank=True, null=True)
    utilisateur = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nom} {self.prenom}"

# ====== NOTIFICATIONS ======
class Notification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")

    def __str__(self):
        return self.title

# ====== DEMANDE EN ATTENTE D'APPROBATION ======
class PendingRequest(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Demande en attente de {self.user.username}"

# ====== EVENEMENTS ======
class Evenement(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='evenements')
    type_evenement = models.CharField(max_length=100)
    date = models.DateField()
    dossiers_a_fournir = models.TextField(blank=True)

    def __str__(self):
        return f"{self.agent.im} - {self.type_evenement} - {self.date}"

# ====== SIGNATURES DES DOSSIERS ======
class DossierSignature(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='signatures')
    evenement = models.ForeignKey(Evenement, on_delete=models.CASCADE, related_name='signatures')
    nom_dossier = models.CharField(max_length=255)
    signature_image = models.TextField()  # base64 string ou chemin de fichier
    date_signature = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.agent.im} - {self.nom_dossier} signé le {self.date_signature.strftime('%d/%m/%Y')}"