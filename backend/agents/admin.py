from django.contrib import admin
from .models import Agent, Evenement, DossierSignature

admin.site.register(Agent)
admin.site.register(Evenement)
admin.site.register(DossierSignature)