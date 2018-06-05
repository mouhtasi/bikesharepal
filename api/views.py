from django.http import JsonResponse
from bikesharestationcatalog.serializers import serialize_geojson
from bikesharestationcatalog.models import Station
from datetime import timezone
import pytz


def stations(request):
    return JsonResponse(serialize_geojson(Station.objects.filter(enabled=True).order_by('name'), returnjson=False))


def stations_last_updated(request):
    return JsonResponse({'last_updated': Station.objects.filter(enabled=True).first().last_updated.replace(
        tzinfo=timezone.utc).astimezone(tz=pytz.timezone('America/Toronto')).strftime('%I:%M %p')})
