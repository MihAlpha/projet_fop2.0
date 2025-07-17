from django.urls import path
from .views import (
    ConversationListView,
    ConversationDetailView,
    envoyer_message,
    liste_messages
)

urlpatterns = [
    path('conversations/<int:agent_id>/', ConversationListView.as_view(), name='liste_conversations'),
    path('conversation/<int:agent_id>/<str:role>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('messages/envoyer/', envoyer_message, name='envoyer_message'),
    path('messages/', liste_messages, name='liste_messages'),
]
