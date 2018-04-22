/* global L, axios, cmap, d3, d3pie, CATEGORY_COLORS */

const MIN_ZOOM = 12;
const MAX_ZOOM = 20;
// Hackathon location
const INIT_LATITUDE = 49.4741797;
const INIT_LONGITUDE = 8.4898994;

const CATEGORY_NAMES = [
  'Restaurant',
  'Shops',
  'Health ',
  'Nightlife',
  'Entertainment',
  'Animal related',
  'Sport',
  'Hotel',
  'Financial services',
  'Public services & government',
  'Religious organizations',
  'Education',
  'Transportation',
  '18+'
];

const initMap = () => {
  const map = new L.Map('map', {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    center: [INIT_LATITUDE, INIT_LONGITUDE],
    zoom: 14,
    editable: true,
    preferCanvas: true
  });

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osm = new L.TileLayer(osmUrl, {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    subdomains: 'c'
  });
  map.addLayer(osm);
  map.setView(new L.LatLng(INIT_LATITUDE, INIT_LONGITUDE));

  L.controlCredits({
    image: 'http://hackathon.nextiteration.de/wp-content/uploads/2018/02/hackathon2.jpg',
    link: 'http://hackathon.nextiteration.de/',
    text: 'Hack.Data.KI.Bots'
  }).addTo(map);

  const stopPromise = axios.get('../datasets/haltestellen.json');
  const allNodesPromise = axios.get('../datasets/all_nodes.json');
  const relationPromise = axios.get(
    '../datasets/closest_stations/establishments_closest_station.json'
  );
  const categoriesPromise = axios.get('../datasets/categories.json');

  const pieChart = (name, l) => {
    new d3pie('pieChart', {
      header: {
        title: {
          text: name,
          fontSize: 24,
          font: 'sans-serif'
        }
      },
      size: {
        canvasWidth: 480,
        pieOuterRadius: '80%'
      },
      data: {
        sortOrder: 'value-desc',
        content: l.map((v, i) => ({
          label: CATEGORY_NAMES[i],
          color: CATEGORY_COLORS[i],
          value: v
        }))
      },
      labels: {
        outer: {
          pieDistance: 10
        },
        inner: {
          format: 'none',
          hideWhenLessThanPercentage: 3
        },
        mainLabel: {
          fontSize: 16
        },
        value: {
          color: '#adadad',
          fontSize: 11
        },
        lines: {
          enabled: false
        },
        truncation: {
          enabled: false
        }
      },
      effects: {
        load: {
          effect: 'none'
        }
      },
      misc: {
        gradient: {
          enabled: true,
          percentage: 100
        }
      }
    });
  };

  const stopsHandler = (res, allNodes, relations) => {
    const data = res.data;
    const stopLocations = [];
    const stopLayers = [];
    for (const stopId in data) {
      if (!data.hasOwnProperty(stopId)) {
        return;
      }
      const { name, stops, id } = data[stopId];
      var avgLat = 0;
      var avgLng = 0;
      stops.forEach(({ lat, lon }) => {
        avgLat += lat;
        avgLng += lon;
        stopLayers.push(
          L.circleMarker(new L.LatLng(lat, lon), {
            color: '#ee7203',
            radius: 6,
            weight: 1,
            fillOpacity: 0.6,
            keyboard: false,
            id: id,
            title: name
          })
            .bindPopup('<div id="pieChart"></div>', { maxWidth: 480, minWidth: 480 })
            .on('popupopen', e => {
              highlightedMarkers.forEach(m => map.removeLayer(m));
              highlightedMarkers = [];
              const nodes = relations[e.target.options.id].map(i => allNodes[i]);
              const vectors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
              nodes.forEach(({ lat, lon, type, category }) => {
                if (category !== undefined) {
                  vectors[category] += 1;
                }
                const marker = L.circleMarker(new L.LatLng(lat, lon), {
                  color: '#0000ff',
                  radius: 6,
                  weight: 1,
                  fillOpacity: 0.6,
                  keyboard: false
                })
                  .bindPopup(
                    `category:${
                      category === undefined ? 'None' : CATEGORY_NAMES[category]
                    }<br\>${type}`
                  )
                  .addTo(map);
                highlightedMarkers.push(marker);
              });

              console.log(vectors);
              setTimeout(() => {
                pieChart(name, vectors);
                const px = map.project(e.popup._latlng);
                px.y -= 265;
                map.panTo(map.unproject(px), { animate: true });
              }, 500);
            })
        );
      });
      stopLocations.push([avgLat / stops.length, avgLng / stops.length]);
    }
    const stopGroup = L.layerGroup(stopLayers).addTo(map);

    const voronoi = d3
      .voronoi()
      .extent([[49.34345 - 0.05, 8.170481 - 0.05], [49.581196 + 0.05, 8.811391 + 0.05]]);
    const polygons = voronoi(stopLocations);
    const voronoiLayers = polygons.edges
      .filter(([p1, p2]) => p1 !== null && p2 !== null)
      .map(([p1, p2]) => {
        return L.polyline([p1, p2], { color: 'black', weight: 1 });
      });
    const voronoiGroup = L.layerGroup(voronoiLayers);

    return [stopGroup, voronoiGroup];
  };

  var highlightedMarkers = [];

  const allNodesHandler = res => {
    const data = res.data;
    const heatMaps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(cat => {
      const subData = data
        .filter(({ category }) => category === cat)
        .map(({ lat, lon }) => [lat, lon, 1]);

      const heatMap = L.heatLayer(subData, {
        radius: 25,
        max: 1,
        gradient: cmap,
        minOpacity: 0.7,
        blur: 25
      });

      return heatMap;
    });

    return heatMaps;
  };

  Promise.all([stopPromise, allNodesPromise, relationPromise, categoriesPromise]).then(
    ([stopRes, allNodesRes, relationRes, categoriesRes]) => {
      allNodesRes.data.forEach(o => (o['category'] = categoriesRes.data[o['type']]));
      const heatMaps = allNodesHandler(allNodesRes);
      const [stopGroup, voronoiGroup] = stopsHandler(
        stopRes,
        allNodesRes.data,
        relationRes.data
      );

      const opt = {
        Stops: stopGroup,
        'Voronoi Boundaries': voronoiGroup
      };
      heatMaps.forEach((hm, i) => (opt[CATEGORY_NAMES[i]] = hm));
      L.control.layers(null, opt).addTo(map);
    }
  );
};

initMap();
