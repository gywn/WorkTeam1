from pprint import pprint
import overpass


def main():
    api = overpass.API()
    # Every bar in center Mannheim
    # about "amenity" key: https://wiki.openstreetmap.org/wiki/Key:amenity
    response = api.get("""node["amenity"="bar"](49.47983,8.45312,49.49544,8.47749);""")

    pprint(response)

    for feature in response['features']:
        print(feature['geometry']['coordinates'])


if __name__ == '__main__':
    main()
