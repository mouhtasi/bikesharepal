from django.urls import path, include, re_path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    re_path(r'^(android-chrome-192x192.png)|(android-chrome-512x512.png)|(apple-touch-icon.png)|(browserconfig.xml)|'
         +'(favicon.ico)|(favicon-16x16.png)|(favicon-32x32.png)|(mstile-150x150.png)|(safari-pinned-tab.svg)'
          '|(site.webmanifest)', views.favicon),
    path('stations/', include('bikesharestationcatalog.urls')),
]
