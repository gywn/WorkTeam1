from pprint import pprint
import json
import requests

# RNV's bbox
BBOX = (49.28034843646649, 8.03375244140625, 49.60893018211529, 8.865966796875)


def get_nodes(node_type):
    response = requests.post('http://overpass-api.de/api/interpreter', {
        'data':
        """[out:json]
        [bbox:{1},{2},{3},{4}];
        node["{0}"];
        out body;""".format(node_type, *BBOX)
    })
    result = json.loads(response.text)
    return result['elements']


def main():
    all_nodes = []
    general_node_types = set()
    for node_type in ('amenity', 'leisure', 'tourism'):
        nodes = get_nodes(node_type)
        for n in nodes:
            general_node_type = '{0}:{1}'.format(node_type,
                                                 n['tags'][node_type])
            n['type'] = general_node_type
            general_node_types.add(general_node_type)
        all_nodes += nodes

    print(general_node_types)
    print(len(general_node_types))
    with open('all_nodes.json', 'w') as f:
        json.dump(all_nodes, f)
    print(len(all_nodes))


if __name__ == '__main__':
    main()
