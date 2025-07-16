from rest_framework import serializers
from .models import Message
from agents.models import Agent

class AgentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'nom', 'prenom']

class MessageSerializer(serializers.ModelSerializer):
    expediteur = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'

    def get_expediteur(self, obj):
        if obj.expediteur:
            return {
                "id": obj.expediteur.id,
                "nom": obj.expediteur.nom,
                "prenom": obj.expediteur.prenom
            }
        return None
