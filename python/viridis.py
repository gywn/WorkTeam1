import json
from matplotlib import pyplot as plt
import numpy as np


def f2h(color):
    return '{0:02x}'.format(min(int(np.floor(color * 256)), 255))


def main():
    cmap = plt.get_cmap('viridis')
    h = {
        i / 256: '#{0}{1}{2}'.format(f2h(r), f2h(g), f2h(b))
        for i, (r, g, b) in enumerate(cmap.colors)
    }
    with open('../html/viridis.js', 'w') as f:
        f.write('const cmap = ' + json.dumps(h) + ';')


if __name__ == '__main__':
    main()
