from django.db.models import QuerySet
import json
from django.core.serializers.json import DjangoJSONEncoder


def serialize_geojson(model_queryset, returnjson=True):
    geo = {'type': 'FeatureCollection', 'features': []}

    if not isinstance(model_queryset, QuerySet):
        model_queryset = [model_queryset]

    for model in model_queryset:
        geo['features'].append({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [model.longitude, model.latitude]
            },
            'properties': {
                'id': model.id,
                'name': model.name,
                'num_bikes_available': model.num_bikes_available,
                'num_docks_available': model.num_docks_available
            }
        })

    if returnjson:
        return json.dumps(geo, cls=DjangoJSONEncoder)
    else:
        return geo


def serialize_availability_json(qs):
    data = {}
    capacity = qs[0].station.capacity
    for station_record in qs:
        data[station_record.day_of_week] = []
        for time, time_data in station_record.time_data.items():
            num_bikes = round(time_data['mean'] * capacity)
            data[station_record.day_of_week].append(num_bikes)

    return json.dumps(data, cls=DjangoJSONEncoder)