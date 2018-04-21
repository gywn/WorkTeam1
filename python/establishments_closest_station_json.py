import json
from collections import defaultdict
import numpy as np


def main():
    csv = np.loadtxt('../datasets/closest_stations/establishments_closest_station.csv')

    with open('../datasets/haltestellen.json', 'r') as f:
        hs_id = sorted([int(k) for k in json.load(f).keys()])

    sta_est = defaultdict(list)

    for j, i in enumerate(csv):
        sta_est[hs_id[int(i)]].append(j)

    with open('../datasets/closest_stations/establishments_closest_station.json', 'w') as f:
        json.dump(sta_est, f)


if __name__ == '__main__':
    main()
