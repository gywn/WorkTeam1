import json
import requests

response = requests.get('https://opendata.rnv-online.de/sites/default/files/Haltestellen_79.json')
o = json.loads(response.text)