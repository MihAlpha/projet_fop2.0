# Generated by Django 5.1.7 on 2025-04-18 11:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agents', '0006_alter_agent_qualite'),
    ]

    operations = [
        migrations.AlterField(
            model_name='agent',
            name='im',
            field=models.CharField(max_length=6, unique=True),
        ),
    ]
