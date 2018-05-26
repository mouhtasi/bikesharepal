from django.contrib.sitemaps import Sitemap
from bikesharestationcatalog.models import Station
from django.urls import reverse


class StationDetailsSiteMap(Sitemap):
    changeFreq = 'daily'
    protocol = 'https'

    def items(self):
        return Station.objects.filter(enabled=True).order_by('id')


class StaticViewSiteMap(Sitemap):
    changeFreq = 'weekly'
    protocol = 'https'

    def items(self):
        return ['index', 'about']

    def location(self, item):
        return reverse(item)
