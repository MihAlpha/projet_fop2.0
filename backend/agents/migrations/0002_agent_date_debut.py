# Generated by Django 5.1.7 on 2025-04-15 19:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agents', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='agent',
            name='date_debut',
            field=models.DateField(default='2024-01-01'),
            preserve_default=False,
        ),
    ]
