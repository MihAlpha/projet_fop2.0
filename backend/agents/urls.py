from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AgentViewSet,
    AdminUserViewSet,
    NotificationViewSet,
    PendingRequestsViewSet,
    login_user,
    register_user,
    forgot_password,
    verify_reset_code,
    reset_password,
    resend_reset_code,
    dashboard_stats,
    EvenementViewSet,
    enregistrer_signature,
    get_signature,
    envoyer_email_si_non_signe,
    verifier_signature,
    evenements_du_jour
)

router = DefaultRouter()
router.register(r'agents', AgentViewSet)
router.register(r'admins', AdminUserViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'api/pending-requests', PendingRequestsViewSet)
router.register(r'evenements', EvenementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_user, name='login_user'),
    path('register/', register_user, name='register_user'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('verify-reset-code/', verify_reset_code, name='verify_reset_code'),
    path('reset-password/', reset_password, name='reset_password'),
    path('resend-reset-code/', resend_reset_code, name='resend_reset_code'),
    path('dashboard-stats/', dashboard_stats, name='dashboard_stats'),
    path('admins/<int:pk>/activate/', AdminUserViewSet.as_view({'patch': 'activate_user'}), name='activate_user'),
    path('enregistrer_signature/', enregistrer_signature, name='enregistrer_signature'),
    path('get_signature/', get_signature, name='get_signature'),
    path('envoyer-email-signature/', envoyer_email_si_non_signe, name='envoyer_email_si_non_signe'),
    path('verifier-signature/', verifier_signature, name='verifier_signature'),
    path('evenements-du-jour/', evenements_du_jour, name='evenements_du_jour'),

]