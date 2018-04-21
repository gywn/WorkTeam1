from pprint import pprint
import json
import requests
import rnv

# RNV's bbox
BBOX = (rnv.MIN_LAT - 0.05, rnv.MIN_LON - 0.05, rnv.MAX_LAT + 0.05,
        rnv.MAX_LON + 0.05)


def main():
    response = requests.post('http://overpass-api.de/api/interpreter', {
        'data':
        """[out:json]
        [bbox:{0},{1},{2},{3}];
        (node[amenity];node[leisure];node[tourism];node[shop]);
        out body;""".format(*BBOX)
    })
    print(response.text)
    result = json.loads(response.text)
    all_nodes = result['elements']

    with open('../datasets/all_nodes.json', 'w') as f:
        json.dump(all_nodes, f)
    print(len(all_nodes))


if __name__ == '__main__':
    main()
