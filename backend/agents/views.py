from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings 
from datetime import timedelta, datetime, date 
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from collections import defaultdict

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer

from .models import Agent, ResetCode, Notification, PendingRequest, Evenement, DossierSignature
from .serializers import AgentSerializer, NotificationSerializer, PendingRequestSerializer, EvenementSerializer
from django.shortcuts import get_object_or_404
import unicodedata
import re
import socket
import traceback


# ===== SERIALIZER POUR USER =====
class AdminUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_active']

# ===== VUE ADMIN UTILISATEURS =====
class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_staff=False, is_superuser=False)
    serializer_class = AdminUserSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['patch'], url_path='activate')
    def activate_user(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        message = "Utilisateur activé." if user.is_active else "Utilisateur désactivé."
        return Response({'message': message}, status=status.HTTP_200_OK)

# ===== VUE AGENTS =====
class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    permission_classes = [AllowAny]

# ===== VUE NOTIFICATIONS =====
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-id')
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'], url_path='read')
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save()
        return Response({'message': 'Notification marquée comme lue.'}, status=status.HTTP_200_OK)

# ===== VUE DEMANDES EN ATTENTE =====
class PendingRequestsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PendingRequest.objects.all().order_by('-id')
    serializer_class = PendingRequestSerializer
    permission_classes = [AllowAny]

# ===== VUE EVENEMENTS =====
class EvenementViewSet(viewsets.ModelViewSet):
    queryset = Evenement.objects.select_related('agent').all().order_by('date')
    serializer_class = EvenementSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='generer-evenements')
    def generer_evenements(self, request):
        agents = Agent.objects.all()
        events_created = 0
        today = date.today()

        for agent in agents:
            if not agent.date_debut or not agent.date_naissance:
                continue

            Evenement.objects.filter(agent=agent).delete()

            calendrier = []
            date_base = agent.date_debut
            naissance = agent.date_naissance
            retraite_date = naissance.replace(year=naissance.year + 60)

            # === CAS 1 : qualité inchangée (E/ELD/EFA → toujours E/ELD/EFA) ===
            if agent.qualite in ['E', 'ELD', 'EFA'] and agent.qualite_initiale in ['E', 'ELD', 'EFA']:
                calendrier.append(("Recrutement", date_base))
                for i in range(1, 6):
                    type_evt = "Avenant" if i % 2 != 0 else "Renouvellement"
                    calendrier.append((type_evt, date_base + relativedelta(years=i)))
                integration_date = date_base + relativedelta(years=6)
                calendrier.append(("Intégration", integration_date))

                avancement_date = integration_date + relativedelta(years=1)
                while avancement_date < retraite_date:
                    calendrier.append(("Avancement", avancement_date))
                    avancement_date += relativedelta(years=2)

            # === CAS 2.1 : erreur corrigée (E/ELD/EFA → Fonctionnaire) ===
            elif agent.qualite == 'Fonctionnaire' and agent.qualite_initiale in ['E', 'ELD', 'EFA']:
                integration_date = date_base
                calendrier.append(("Intégration", integration_date))

                avancement_date = integration_date + relativedelta(years=1)
                while avancement_date < retraite_date:
                    calendrier.append(("Avancement", avancement_date))
                    avancement_date += relativedelta(years=2)

            # === CAS 2.2 : erreur corrigée (Fonctionnaire → E/ELD/EFA) ===
            elif agent.qualite in ['E', 'ELD', 'EFA'] and agent.qualite_initiale == 'Fonctionnaire':
                calendrier.append(("Recrutement", date_base))
                for i in range(1, 6):
                    type_evt = "Avenant" if i % 2 != 0 else "Renouvellement"
                    calendrier.append((type_evt, date_base + relativedelta(years=i)))
                integration_date = date_base + relativedelta(years=6)
                calendrier.append(("Intégration", integration_date))

                avancement_date = integration_date + relativedelta(years=1)
                while avancement_date < retraite_date:
                    calendrier.append(("Avancement", avancement_date))
                    avancement_date += relativedelta(years=2)

            # === CAS par défaut (Fonctionnaire dès le début et correct) ===
            elif agent.qualite == 'Fonctionnaire':
                integration_date = date_base
                calendrier.append(("Intégration", integration_date))
                avancement_date = integration_date + relativedelta(years=1)
                while avancement_date < retraite_date:
                    calendrier.append(("Avancement", avancement_date))
                    avancement_date += relativedelta(years=2)

            # === Ajouter retraite à la fin ===
            calendrier.append(("Retraite", retraite_date))

            evenements = [
                Evenement(agent=agent, type_evenement=type_evt, date=date_evt)
                for type_evt, date_evt in calendrier if date_evt >= today
            ]
            Evenement.objects.bulk_create(evenements)
            events_created += len(evenements)

        return Response({"message": f"{events_created} événements créés."}, status=200)

# ===== DASHBOARD STATISTIQUES =====
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    from collections import defaultdict

    total_agents = Agent.objects.count()
    total_admins = User.objects.filter(is_staff=False, is_superuser=False).count()
    today = timezone.now().date()
    today_events = Evenement.objects.filter(date=today).count()
    total_events = Evenement.objects.count()

    # Tous les types d'événements possibles
    all_event_types = ["Recrutement", "Avenant", "Renouvellement", "Intégration", "Avancement", "Retraite"]

    # Préparer les statistiques par année et par type
    yearly_stats = defaultdict(lambda: defaultdict(int))
    for evt in Evenement.objects.all():
        year = evt.date.year
        type_evt = evt.type_evenement
        yearly_stats[year][type_evt] += 1

    # Format final avec 0 par défaut pour les types manquants
    event_stats_by_year = []
    for year in sorted(yearly_stats):
        row = {"year": str(year)}
        for type_evt in all_event_types:
            row[type_evt] = yearly_stats[year].get(type_evt, 0)
        event_stats_by_year.append(row)

    return Response({
        'total_agents': total_agents,
        'total_admins': total_admins,
        'today_events': today_events,
        'total_events': total_events,
        'event_stats_by_year': event_stats_by_year,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def enregistrer_signature(request):
    agent_id = request.data.get("agent")
    type_evenement = request.data.get("evenement")
    nom_dossier = normaliser_nom(request.data.get("nom_dossier"))  # ✅ nom_dossier fixe
    signature_image = request.data.get("signature_image")

    if not all([agent_id, type_evenement, nom_dossier, signature_image]):
        return Response({'message': 'Tous les champs sont requis.'}, status=400)

    try:
        agent = get_object_or_404(Agent, id=agent_id)

        evenement = Evenement.objects.filter(agent=agent, type_evenement=type_evenement).latest("date")

        # Vérifie si la signature existe déjà
        existe = DossierSignature.objects.filter(
            agent=agent,
            evenement=evenement,
            nom_dossier=nom_dossier
        ).exists()

        if existe:
            return Response({'message': 'Signature déjà enregistrée.'}, status=200)

        DossierSignature.objects.create(
            agent=agent,
            evenement=evenement,
            nom_dossier=nom_dossier,
            signature_image=signature_image
        )

        print("✅ Signature enregistrée avec succès.")
        return Response({'message': 'Signature enregistrée avec succès.'}, status=201)

    except Evenement.DoesNotExist:
        return Response({'message': 'Événement non trouvé pour cet agent et type.'}, status=404)

    except Exception as e:
        return Response({'message': f'Erreur serveur : {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_signature(request):
    agent_id = request.GET.get("agent_id")
    evenement = request.GET.get("evenement")
    nom_dossier = normaliser_nom(request.GET.get("nom_dossier"))  # ✅ Ajout de normalisation ici

    print(f"🔍 Requête reçue : agent_id={agent_id}, evenement={evenement}, nom_dossier={nom_dossier}")
    print(f"Requête GET signature : agent={agent_id}, evenement={evenement}, dossier={nom_dossier}")
    try:
        signature = DossierSignature.objects.filter(
            agent__id=agent_id,
            evenement__type_evenement=evenement,
            nom_dossier=nom_dossier
        ).latest("id")

        print("✅ Signature trouvée :", signature.signature_image)

        return Response({
            'signature_image': signature.signature_image,
            'signature_existe': True
        }, status=200)

    except DossierSignature.DoesNotExist:
        print("❌ Signature non trouvée")
        return Response({'signature_image': None, 'signature_existe': False}, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ✅ Fonction déjà correcte
def normaliser_nom(nom):
    if nom:
        nom = unicodedata.normalize('NFD', nom)
        nom = nom.encode('ascii', 'ignore').decode('utf-8')
        nom = nom.lower()
        nom = re.sub(r'\s+', '_', nom)
        return nom.strip()
    return ""

@api_view(['GET'])
@permission_classes([AllowAny])
def verifier_signature(request):
    agent_id = request.GET.get("agent_id")
    type_evenement = request.GET.get("evenement")
    nom_dossier = normaliser_nom(request.GET.get("nom_dossier"))

    print(f"🔍 Vérification signature : agent_id={agent_id}, type_evenement={type_evenement}, nom_dossier={nom_dossier}")

    try:
        signature = DossierSignature.objects.filter(
            agent__id=agent_id,
            evenement__type_evenement=type_evenement,
            nom_dossier=nom_dossier
        ).latest("id")

        print("✅ Signature trouvée")
        return Response({'signature_existe': True}, status=200)

    except DossierSignature.DoesNotExist:
        print("❌ Signature non trouvée")
        return Response({'signature_existe': False}, status=200)

    except Exception as e:
        import traceback
        print("❌ Erreur dans verifier_signature :", traceback.format_exc())
        return Response({'signature_existe': False}, status=500)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        # Vérifie si l'IP est locale (localhost)
        if ip.startswith("127.") or ip == "0.0.0.0":
            # Tu peux remplacer ici par l'IP réelle de ta machine sur le réseau local
            print("IP locale détectée comme localhost, à remplacer manuellement si besoin")
            return ip  # ou une IP fixe si tu veux : ex "192.168.x.x"
        return ip
    except Exception as e:
        print("Erreur get_local_ip:", e)
        return "localhost"

@api_view(['POST'])
@permission_classes([AllowAny])
def envoyer_email_si_non_signe(request):
    agent_id = request.data.get("agent_id")
    type_evenement = request.data.get("type_evenement")
    nom_dossier = request.data.get("nom_dossier")

    nom_dossier = normaliser_nom(nom_dossier)

    try:
        agent = Agent.objects.get(id=agent_id)
        email = agent.email

        signature_existe = DossierSignature.objects.filter(
            agent=agent,
            evenement__type_evenement=type_evenement,
            nom_dossier=nom_dossier
        ).exists()

        if signature_existe:
            return Response({'message': "Le dossier a déjà été signé."}, status=200)

        ip_locale = get_local_ip()
        print("IP locale récupérée :", ip_locale)
        lien_interface_agent = f"http://{ip_locale}:3000/agent-interface/{agent.id}"
        print("Lien interface agent généré :", lien_interface_agent)

        message = f"""
Bonjour {agent.nom},

Veuillez signer le dossier '{nom_dossier}' pour l'événement '{type_evenement}' sur la plateforme.

Cliquez ici pour accéder à votre interface agent :
{lien_interface_agent}

Merci.
"""

        send_mail(
            "Signature requise",
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({'message': 'Email envoyé avec succès car le dossier n’est pas encore signé.'}, status=200)

    except Agent.DoesNotExist:
        return Response({'message': 'Agent non trouvé.'}, status=404)
    except Exception as e:
        print("Erreur lors de l'envoi d'email :", traceback.format_exc())
        return Response({'message': f'Erreur : {str(e)}'}, status=500)
        
# ====== AUTHENTIFICATION ET MOT DE PASSE ======
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'message': 'Nom d’utilisateur et mot de passe requis.'}, status=400)

    user = authenticate(username=username, password=password)

    if user:
        if not user.is_active:
            return Response({'message': "Votre compte est désactivé par l'administrateur."}, status=403)
        return Response({
            'message': 'Connexion réussie',
            'username': user.username,
            'email': user.email,
            'is_superuser': user.is_superuser,
        }, status=200)
    else:
        return Response({'message': 'Vous n’êtes pas autorisé par l’administrateur !'}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response({'message': 'Tous les champs sont requis.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'message': 'Ce nom d’utilisateur existe déjà.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'message': 'Cet e-mail est déjà utilisé.'}, status=400)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_active = False
        user.save()

        super_admin = User.objects.filter(is_superuser=True).first()
        if super_admin:
            Notification.objects.create(
                title="Demande d'activation de compte",
                message=f"Un nouvel utilisateur nommé **{user.username}** vient de s’inscrire. Veuillez examiner et activer ce compte pour autoriser l'accès à la plateforme.",
                user=user
            )

        return Response({'message': 'Utilisateur créé avec succès !'}, status=201)
    except Exception as e:
        return Response({'message': f'Erreur lors de la création de l’utilisateur : {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'message': 'L’e-mail est requis.'}, status=400)

    try:
        user = User.objects.get(email=email)
        code = get_random_string(length=6, allowed_chars='0123456789')
        ResetCode.objects.update_or_create(user=user, defaults={'code': code, 'created_at': timezone.now()})

        send_mail(
            'Code de réinitialisation',
            f'Voici votre code : {code}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Code envoyé avec succès.'}, status=200)
    except User.DoesNotExist:
        return Response({'message': 'Utilisateur non trouvé.'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_code(request):
    email = request.data.get('email')
    code = request.data.get('code')
    if not email or not code:
        return Response({'message': 'Email et code requis.'}, status=400)

    try:
        user = User.objects.get(email=email)
        reset_code = ResetCode.objects.get(user=user)

        if reset_code.created_at < timezone.now() - timedelta(minutes=10):
            return Response({'message': 'Code expiré.'}, status=400)

        if reset_code.code == code:
            return Response({'message': 'Code vérifié avec succès.'}, status=200)
        else:
            return Response({'message': 'Code invalide.'}, status=400)
    except (User.DoesNotExist, ResetCode.DoesNotExist):
        return Response({'message': 'Utilisateur ou code non trouvé.'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not email or not new_password or not confirm_password:
        return Response({'message': 'Tous les champs sont requis.'}, status=400)

    if new_password != confirm_password:
        return Response({'message': 'Les mots de passe ne correspondent pas.'}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        ResetCode.objects.filter(user=user).delete()

        return Response({'message': 'Mot de passe réinitialisé avec succès !'}, status=200)
    except User.DoesNotExist:
        return Response({'message': 'Utilisateur non trouvé.'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_reset_code(request):
    email = request.data.get('email')

    if not email:
        return Response({'message': 'L’e-mail est requis.'}, status=400)

    try:
        user = User.objects.get(email=email)
        code = get_random_string(length=6, allowed_chars='0123456789')
        ResetCode.objects.update_or_create(user=user, defaults={'code': code, 'created_at': timezone.now()})

        send_mail(
            'Nouveau code de réinitialisation',
            f'Votre nouveau code est : {code}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Nouveau code envoyé avec succès.'}, status=200)
    except User.DoesNotExist:
        return Response({'message': 'Utilisateur non trouvé.'}, status=404)
