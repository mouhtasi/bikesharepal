from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalog_home, name='index'),  # since the catalog page is the index now
    path('', views.catalog_home, name='station_catalog_home'),
    path('station_details/<int:s_id>/', views.station_details, name='station_details'),
    path('about', views.about, name='about')
]
