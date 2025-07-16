from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.utils import timezone
from .models import Message
from .serializers import MessageSerializer
from django.db.models import Q

class ConversationListView(APIView):
    def get(self, request, agent_id):
        # Rôles vers lesquels cet agent a déjà envoyé un message
        messages = Message.objects.filter(expediteur_id=agent_id)
        destinataires = set(msg.destinataire_role for msg in messages)
        return Response(list(destinataires))


class ConversationDetailView(APIView):
    def get(self, request, agent_id, role):
        messages = Message.objects.filter(
            Q(expediteur_id=agent_id, destinataire_role=role) |
            Q(expediteur_role=role, destinataire_role="Agent", expediteur__id=agent_id)
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
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def liste_messages(request):
    expediteur_id = request.GET.get('expediteur_id')
    destinataire = request.GET.get('destinataire')

    messages = Message.objects.all()
    if expediteur_id:
        messages = messages.filter(expediteur_id=expediteur_id)
    if destinataire:
        messages = messages.filter(destinataire_role=destinataire)

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)