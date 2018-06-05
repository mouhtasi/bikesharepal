from django.shortcuts import render
from bikesharestationcatalog.models import Station, StationImage, StationAverageLog
from bikesharestationcatalog.forms import ImageForm
from datetime import timezone
import pytz
from bikesharestationcatalog.serializers import serialize_availability_json, serialize_geojson


def catalog_home(request):
    # we'll send the stations to build a table in case JS isn't enabled to show a map
    stations = Station.objects.filter(enabled=True).order_by('name')
    last_updated = stations.order_by('last_updated').first().last_updated.replace(tzinfo=timezone.utc).astimezone(
        tz=pytz.timezone('America/Toronto')).strftime('%I:%M %p')
    geojson = serialize_geojson(stations, returnjson=True)  # for the map
    return render(request, 'bikesharestationcatalog/catalog.html',
                  {'geojson': geojson, 'stations': stations, 'last_updated': last_updated})


def station_details(request, s_id):
    station = Station.objects.get(id=s_id)
    station_averages = serialize_availability_json(StationAverageLog.objects.filter(station_id=s_id))
    images = StationImage.objects.filter(station=station, approved=True)
    message = None

    if request.method == 'POST':
        form = ImageForm(request.POST, request.FILES)
        if form.is_valid():
            newimg = StationImage(station=station, image=request.FILES['imgfile'])
            newimg.save()
            message = 'Thank you. Your photo has been submitted for approval.'
    else:
        form = ImageForm()

    geojson = serialize_geojson(station)

    return render(request, 'bikesharestationcatalog/station_details.html', {'station': station, 'geojson': geojson,
                                                                            'form': form, 'images': images,
                                                                            'station_averages': station_averages,
                                                                            'message': message})


def about(request):
    num_stations = Station.objects.filter(enabled=True).count();
    return render(request, 'bikesharestationcatalog/about.html', {'num_stations': num_stations});
