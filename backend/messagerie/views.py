from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer


class ConversationListView(APIView):
    def get(self, request, agent_id):
        # Liste des rôles avec qui l’agent a déjà échangé
        messages = Message.objects.filter(expediteur_id=agent_id)
        destinataires = set(msg.destinataire_role for msg in messages)
        return Response(list(destinataires))


class ConversationDetailView(APIView):
    def get(self, request, agent_id, role):
        messages = Message.objects.filter(
            Q(expediteur_id=agent_id, destinataire_role=role) |
            Q(expediteur_role=role, destinataire_id=agent_id)
        ).order_by("date_envoi")

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


@api_view(['POST'])
def envoyer_message(request):
    try:
        data = request.data
        message = Message.objects.create(
            expediteur_id=data.get('expediteur_id'),
            expediteur_role=data.get('expediteur_role'),
            destinataire_role=data.get('destinataire_role'),
            contenu=data.get('contenu'),
            date_envoi=timezone.now()
        )
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def liste_messages(request):
    expediteur_id = request.GET.get('expediteur_id')
    destinataire_role = request.GET.get('destinataire_role')

    if not expediteur_id or not destinataire_role:
        return Response({"error": "expediteur_id et destinataire_role requis"}, status=400)

    messages = Message.objects.filter(
        Q(expediteur_id=expediteur_id, destinataire_role=destinataire_role) |
        Q(expediteur_role=destinataire_role, destinataire_id=expediteur_id)
    ).order_by("date_envoi")

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)
