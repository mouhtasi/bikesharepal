from django.urls import path
from . import views

urlpatterns = [
    path('stations', views.stations),
    path('last_updated', views.stations_last_updated)
]
