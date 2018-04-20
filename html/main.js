/* global L */

const MIN_ZOOM = 8;
const MAX_ZOOM = 20;
// Hackathon location
const INIT_LATITUDE = 49.4741797;
const INIT_LONGITUDE = 8.4898994;

const initMap = () => {
  const map = new L.Map('map', {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    center: [INIT_LATITUDE, INIT_LONGITUDE],
    zoom: 14,
    editable: true
  });

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osm = new L.TileLayer(osmUrl, {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM
  });
  map.addLayer(osm);

  map.setView(new L.LatLng(INIT_LATITUDE, INIT_LONGITUDE));
};

initMap();
