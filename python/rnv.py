import json

#import requests internet Abfrage
#response = requests.get('https://opendata.rnv-online.de/sites/default/files/Haltestellen_79.json')
fh = open('../datasets/haltestellen.json', 'r') #locale abfrage
haltestellen = json.load(fh)

MIN_LAT = 90
MAX_LAT = -90
MIN_LON = 180
MAX_LON = -180

for name in haltestellen:
    for stop in haltestellen[name]['stops']:
        MIN_LAT = min(MIN_LAT, stop['lat'])
        MAX_LAT = max(MAX_LAT, stop['lat'])
        MIN_LON = min(MIN_LON, stop['lon'])
        MAX_LON = max(MAX_LON, stop['lon'])


fh = open('../datasets/Linien.json','r')
Linien = json.load(fh)

fh = open('../datasets/Linien_mit_Haltestellenreferenz.json','r')
Linien_mit_Haltestellenreferenz = json.load(fh)

fh = open('../datasets/Haltestellen_mit_Linienreferenz.json','r')
Haltestellen_mit_Linienreferenz = json.load(fh)


if __name__ == '__main__':
    print(MIN_LAT)
    print(MAX_LAT)
    print(MIN_LON)
    print(MAX_LON)