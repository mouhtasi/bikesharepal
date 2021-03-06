from django.core.management.base import BaseCommand, CommandError
from bikesharestationcatalog.models import Station, StationAverageLog
import requests
import json
import pytz
from datetime import datetime, timedelta
from time import sleep


# TODO: Add a check to only update if data is changed


class Command(BaseCommand):
    help = 'Updates the Station table using API data'

    def handle(self, *args, **options):
        tries = 0
        while tries < 5:
            tries += 1
            response = requests.get('https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_information')
            if response.status_code != requests.codes.ok:
                sleep(1)
                if tries == 5:
                    raise CommandError('Failed to access station_information API after 5 tries')
            elif response.status_code == requests.codes.ok:
                station_information = json.loads(response.content)['data']['stations']

        tries = 0
        while tries < 5:
            tries += 1
            response = requests.get('https://tor.publicbikesystem.net/ube/gbfs/v1/en/station_status')
            if response.status_code != requests.codes.ok:
                sleep(1)
                if tries == 5:
                    raise CommandError('Failed to access station_status API after 5 tries')
            elif response.status_code == requests.codes.ok:
                stations_json = json.loads(response.content)

        station_status = stations_json['data']['stations']
        last_updated = datetime.fromtimestamp(stations_json['last_updated'], tz=pytz.timezone('America/Toronto'))

        station_status_merged = {}
        for station in station_information + station_status:
            key = station['station_id']
            if key not in station_status_merged:
                station_status_merged[key] = {}
            station_status_merged[key].update(station)

        d = datetime.now(pytz.timezone('America/Toronto'))
        d = d - timedelta(minutes=d.minute % 5, seconds=d.second,
                          microseconds=d.microsecond)  # round down to the nearest 5 minutes
        time = d.strftime('%H:%M')
        day = d.strftime('%A')

        num_updated = 0
        num_created = 0
        num_ignored = 0
        for station in station_status_merged.values():
            # there are stations that have no data but exist in one of the api outputs
            if station['last_reported'] and 'name' in station:
                s, created = Station.objects.update_or_create(id=station['station_id'],
                                                              defaults={'name': station['name'],
                                                                        'longitude': station['lon'],
                                                                        'latitude': station['lat'],
                                                                        'capacity': station['capacity'],
                                                                        'num_bikes_available': station[
                                                                            'num_bikes_available'],
                                                                        'num_docks_available': station[
                                                                            'num_docks_available'],
                                                                        'enabled': True,
                                                                        'last_updated': last_updated})
                if created:
                    num_created += 1
                else:
                    num_updated += 1

                if station['capacity'] != 0:  # there may be a station with a listed capacity of 0
                    self.update_average(s, station['num_bikes_available'], station['capacity'], time, day)
            else:
                num_ignored += 1

        self.stdout.write(self.style.SUCCESS('Stations updated. {} updated. {} created. {} ignored.'.format(num_updated,
                                                                                                            num_created,
                                                                                                            num_ignored
                                                                                                            )))

        self.disable_unlisted_stations(station_status_merged.keys())

    def update_average(self, station, num_bikes_available, capacity, time, day):
        # check if the historical object exists
        # if not then the count is 1 and average is current value
        # else get the data, calculate the new average
        # save

        # time_data is {'00:05': {mean=1, count=1}, ...
        station_average, created = StationAverageLog.objects.get_or_create(station=station, day_of_week=day, defaults={
            'time_data': {time: {
                'mean': 0,
                'count': 0
            }}})

        if created:
            station_average.time_data[time]['mean'] = round(num_bikes_available / capacity, 2)
            station_average.time_data[time]['count'] = 1
        else:
            if time not in station_average.time_data.keys():
                station_average.time_data[time] = {'mean': 0, 'count': 0}
            # cumulative mean
            new_mean = (station_average.time_data[time]['mean'] * station_average.time_data[time]['count']
                        + num_bikes_available / capacity) / (station_average.time_data[time]['count'] + 1)
            station_average.time_data[time]['mean'] = round(new_mean, 2)
            station_average.time_data[time]['count'] += 1

        station_average.save()

        # self.stdout.write(
        #     'Day: {}, Time: {}, Count: {}, Mean: {}, Station: {}'.format(day, time,
        #                                                                  station_average.time_data[time]['count'],
        #                                                                  station_average.time_data[time]['mean'],
        #                                                                  station_average.station.name))

    def disable_unlisted_stations(self, station_ids):
        num_unlisted = Station.objects.exclude(id__in=station_ids, enabled=True).update(enabled=False)
        self.stdout.write('{} unlisted station(s).'.format(num_unlisted))
