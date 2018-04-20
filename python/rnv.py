import json

#import requests internet Abfrage
#response = requests.get('https://opendata.rnv-online.de/sites/default/files/Haltestellen_79.json')
fh = open('../haltestellen.json', 'r') #locale abfrage
haltestellen = json.load(fh)