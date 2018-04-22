import re
import json
import numpy as np

SPLIT = re.compile(r'^\d+,(.*);(\d*)$')
TAG_FORMAT = re.compile(r'^(amenity|leisure|tourism|shop):[\w \-;:.,]+$')
SUBTYPE = re.compile(r'.*:(.*)')


def tags_sanity():
    with open('../datasets/all_nodes.json', 'r') as f:
        o = json.load(f)
        s = set()
        for n in o:
            s.add(n['type'])

    for t in s:
        if not TAG_FORMAT.match(t):
            raise ValueError(t)

    return s


def guess(segment, full_types):
    pat = re.compile('.*{0}.*'.format(segment))
    for t in full_types:
        if pat.match(t):
            print(t)


def subtyping(main_type, full_types):
    s = set()
    c = set()
    d = {}
    with open('{0}_subtypes.csv'.format(main_type), 'r') as f:
        for l in f.readlines():
            m = SPLIT.match(l.strip())
            if not m:
                raise ValueError(l.strip())
            full_type, category = '{0}:{1}'.format(main_type, m[1]), m[2]
            if full_type not in full_types:
                guess(full_type, full_types)
                raise ValueError(full_type)
            if category != '':
                if str(int(category)) != category:
                    raise ValueError(category)
                c.add(int(category))
                d[full_type] = int(category) - 1
            s.add(full_type)
    return s, c, d


def sanity():
    s = set()
    c = set()
    d = {}
    full_types = tags_sanity()
    for main_type in ('amenity', 'leisure', 'tourism', 'shop'):
        s0, c0, d0 = subtyping(main_type, full_types)
        s |= s0
        c |= c0
        d = {**d, **d0}
    if full_types - s:
        raise ValueError(s)
    if list(range(1, 15)) != sorted(list(c)):
        print(c)
    print(' '.join([SUBTYPE.match(t)[1] for t in full_types]))
    print(len(full_types))

    with open('../datasets/categories.json', 'w') as f:
        json.dump(d, f)


if __name__ == '__main__':
    sanity()
