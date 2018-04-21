/* global L, axios, cmap, d3, d3pie, CATEGORY_COLORS */

const MIN_ZOOM = 8;
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
    editable: true
  });
  const icon = L.divIcon({ className: 'icon' });
  const icon2 = L.divIcon({ className: 'icon-2' });

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osm = new L.TileLayer(osmUrl, {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    subdomains: 'c'
  });
  map.addLayer(osm);
  map.setView(new L.LatLng(INIT_LATITUDE, INIT_LONGITUDE));

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
          L.marker(new L.LatLng(lat, lon), {
            icon: icon,
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
                const marker = L.marker(new L.LatLng(lat, lon), {
                  icon: icon2,
                  keyboard: false
                })
                  .bindPopup(`${category} ${type}`)
                  .addTo(map);
                highlightedMarkers.push(marker);
              });

              console.log(vectors);
              setTimeout(() => pieChart(name, vectors), 500);
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
    const voronoiGroup = L.layerGroup(voronoiLayers).addTo(map);

    return [stopGroup, voronoiGroup];
  };

  var highlightedMarkers = [];

  const allNodesHandler = res => {
    const data = res.data;
    const restaurants = data
      .filter(({ tags }) => tags['amenity'] === 'restaurant')
      .map(({ lat, lon }) => [lat, lon, 1]);

    const restaurantHeatMap = L.heatLayer(restaurants, {
      radius: 50,
      max: 1,
      gradient: cmap,
      minOpacity: 0.5,
      blur: 25
    });

    return [restaurantHeatMap];
  };

  Promise.all([stopPromise, allNodesPromise, relationPromise, categoriesPromise]).then(
    ([stopRes, allNodesRes, relationRes, categoriesRes]) => {
      allNodesRes.data.forEach(o => (o['category'] = categoriesRes.data[o['type']]));
      const [restaurantHeatMap] = allNodesHandler(allNodesRes);
      const [stopGroup, voronoiGroup] = stopsHandler(
        stopRes,
        allNodesRes.data,
        relationRes.data
      );
      L.control
        .layers(null, {
          Stops: stopGroup,
          'Voronoi Boundaries': voronoiGroup,
          'Heat Map': restaurantHeatMap
        })
        .addTo(map);
    }
  );
};

initMap();
