from pprint import pprint
import json
import requests
import rnv

# RNV's bbox
BBOX = (rnv.MIN_LAT - 0.05, rnv.MIN_LON - 0.05, rnv.MAX_LAT + 0.05,
        rnv.MAX_LON + 0.05)


def get_nodes(node_type):
    response = requests.post('http://overpass-api.de/api/interpreter', {
        'data':
        """[out:json]
        [bbox:{0},{1},{2},{3}];
        (node["{4}"];
        way["{4}"];);
        out body;""".format(*BBOX, node_type)
    })
    result = json.loads(response.text)
    return result['elements']


def main():
    all_nodes = []
    general_node_types = set()
    for node_type in ('amenity', 'leisure', 'tourism', 'shop'):
        nodes = get_nodes(node_type)
        for n in nodes:
            general_node_type = '{0}:{1}'.format(node_type,
                                                 n['tags'][node_type])
            n['type'] = general_node_type
            general_node_types.add(general_node_type)
        all_nodes += nodes

    print(general_node_types)
    print(len(general_node_types))
    with open('../datasets/all_nodes.json', 'w') as f:
        json.dump(all_nodes, f)
    print(len(all_nodes))


if __name__ == '__main__':
    main()
