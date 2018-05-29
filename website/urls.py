from django.urls import path, include, re_path
from django.contrib.sitemaps.views import sitemap
from .sitemaps import StaticViewSiteMap, StationDetailsSiteMap
from . import views
from django.views.generic.base import TemplateView

sitemaps = {
    'static': StaticViewSiteMap,
    'station': StationDetailsSiteMap
}

urlpatterns = [
    path('', include('bikesharestationcatalog.urls')),
    re_path(r'^(android-chrome-192x192.png)|(android-chrome-512x512.png)|(apple-touch-icon.png)|(browserconfig.xml)|'
            + '(favicon.ico)|(favicon-16x16.png)|(favicon-32x32.png)|(mstile-150x150.png)|(safari-pinned-tab.svg)'
              '|(site.webmanifest)', views.favicon),
    # path('stations/', include('bikesharestationcatalog.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('service-worker.js', TemplateView.as_view(template_name="service-worker.js", content_type='application/javascript'),
         name='service-worker')
]
