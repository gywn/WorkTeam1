import json
import segancha as sgc
import numpy as np


def f2h(color):
    return '{0:02x}'.format(min(int(np.floor(color * 256)), 255))


def main():
    rgb = [
        sgc.LABtoRGB(sgc.LCHtoLAB(sgc.maxChroma((60, 0, h))))
        for h in 360 / 14 * np.arange(14)
    ]
    h = ['#{0}{1}{2}'.format(f2h(r), f2h(g), f2h(b)) for r, g, b in rgb]
    with open('../html/category_colors.js', 'w') as f:
        f.write('const CATEGORY_COLORS = ' + json.dumps(h) + ';')


if __name__ == '__main__':
    main()
