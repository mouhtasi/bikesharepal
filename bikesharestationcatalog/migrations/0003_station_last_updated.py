# Generated by Django 2.0.5 on 2018-06-04 02:51

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('bikesharestationcatalog', '0002_station_enabled'),
    ]

    operations = [
        migrations.AddField(
            model_name='station',
            name='last_updated',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]