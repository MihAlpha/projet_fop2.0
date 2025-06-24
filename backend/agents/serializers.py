from rest_framework import serializers
from .models import Agent, Notification, PendingRequest, Evenement, DossierSignature

# Sérialiseur pour Agent
class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'

# Sérialiseur pour Notification
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'created_at', 'is_read']

# Sérialiseur pour PendingRequest
class PendingRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = PendingRequest
        fields = ['id', 'user', 'username', 'email', 'requested_at']

# Sérialiseur pour Evenement
class EvenementSerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)

    class Meta:
        model = Evenement
        fields = ['id', 'agent', 'type_evenement', 'date', 'dossiers_a_fournir']

class DossierSignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DossierSignature
        fields = '__all__'
