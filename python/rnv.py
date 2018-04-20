import json

#import requests internet Abfrage
#response = requests.get('https://opendata.rnv-online.de/sites/default/files/Haltestellen_79.json')
fh = open('../datasets/haltestellen.json', 'r') #locale abfrage
haltestellen = json.load(fh)

fh = open('../datasets/Linien.json','r')
Linien = json.load(fh)

fh = open('../datasets/Linien_mit_Haltestellenreferenz.json','r')
Linien_mit_Haltestellenreferenz = json.load(fh)

fh = open('../datasets/Haltestellen_mit_Linienreferenz.json','r')
Haltestellen_mit_Linienreferenz = json.load(fh)