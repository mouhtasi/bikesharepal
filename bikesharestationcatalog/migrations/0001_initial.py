# Generated by Django 2.0.5 on 2018-05-18 03:57

import bikesharestationcatalog.models
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Station',
            fields=[
                ('id', models.PositiveSmallIntegerField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('longitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('latitude', models.DecimalField(decimal_places=6, max_digits=9)),
                ('capacity', models.PositiveSmallIntegerField()),
                ('num_bikes_available', models.PositiveSmallIntegerField()),
                ('num_docks_available', models.PositiveSmallIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='StationAverageLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day_of_week', models.CharField(max_length=10)),
                ('time_data', django.contrib.postgres.fields.jsonb.JSONField()),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bikesharestationcatalog.Station')),
            ],
        ),
        migrations.CreateModel(
            name='StationImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to=bikesharestationcatalog.models.hash_image)),
                ('date', models.DateField(auto_now_add=True)),
                ('approved', models.BooleanField(default=False)),
                ('station', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bikesharestationcatalog.Station')),
            ],
        ),
    ]
