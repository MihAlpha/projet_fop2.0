# Generated by Django 5.1.7 on 2025-07-16 07:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('agents', '0026_alter_agent_utilisateur_profilutilisateur'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='agent',
            name='utilisateur',
        ),
        migrations.DeleteModel(
            name='ProfilUtilisateur',
        ),
    ]
