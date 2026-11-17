// MapLibre style for the Manila bundle (tile schema in CONTRACT.md).
// Soft, light palette; 3D buildings from z15; labels in Noto Sans Regular only.

const FONT = ['Noto Sans Regular'];

export const C = {
  land: '#f4f3ef',
  water: '#aad3ee',
  waterLine: '#8ec2e6',
  waterLabel: '#4a86b4',
  park: '#cfe9cf',
  forest: '#c3e2c2',
  grass: '#dbefd5',
  cemetery: '#d9e7d6',
  hospital: '#f9e3e3',
  school: '#f4ecdf',
  commercial: '#f6f0e8',
  industrial: '#eeebe6',
  military: '#ece9e4',
  airport: '#e9eaf0',
  sand: '#f3ebd3',
  pitch: '#d3edcf',
  parking: '#eeeeee',
  building: '#e6e3dd',
  buildingLine: '#d9d5ce',
  building3d: '#e9e6e0',
  casing: '#d5d7db',
  road: '#ffffff',
  motorway: '#f7b15e',
  motorwayCase: '#e09443',
  trunk: '#fbcf7e',
  trunkCase: '#e8b65e',
  primary: '#fde7a6',
  primaryCase: '#e5cd8b',
  path: '#c9c3b8',
  rail: '#a9adb3',
  transit: '#8f86b8',
  boundary: '#b5aac8',
  label: '#4b4f56',
  labelSoft: '#7b8089',
  halo: '#ffffff',
};

const roadClassOrder = ['match', ['get', 'class'],
  'motorway', 9, 'trunk', 8, 'primary', 7, 'secondary', 6, 'tertiary', 5,
  'minor', 4, 'service', 3, 'track', 2, 'path', 1, 'steps', 1, 0];

// Road line widths (px) by class and zoom. `extra` = casing width on each side.
// Value order: motorway, trunk, primary, secondary, tertiary, minor, service, other.
const ROAD_W = {
  5: [0.8, 0.6, 0, 0, 0, 0, 0, 0],
  9: [1.6, 1.4, 1.0, 0.6, 0, 0, 0, 0],
  12: [3, 2.6, 2.2, 1.8, 1.4, 0.9, 0, 0],
  14: [6, 5.5, 5, 4.2, 3.6, 2.8, 1.4, 1],
  16: [12, 11, 10, 9, 8, 6.5, 3.5, 1.6],
  19: [34, 30, 28, 26, 24, 20, 11, 3],
};
function roadWidth(extra = 0) {
  const stops = [];
  for (const [z, vals] of Object.entries(ROAD_W)) {
    const v = vals.map((x) => (x > 0 ? x + extra * 2 : 0));
    const byClass = ['match', ['get', 'class'],
      'motorway', v[0], 'trunk', v[1], 'primary', v[2], 'secondary', v[3],
      'tertiary', v[4], 'minor', v[5], 'service', v[6], v[7]];
    stops.push(Number(z), ['case', ['==', ['get', 'ramp'], 1], ['*', byClass, 0.6], byClass]);
  }
  return ['interpolate', ['exponential', 1.6], ['zoom'], ...stops];
}

const roadFill = ['match', ['get', 'class'],
  'motorway', C.motorway, 'trunk', C.trunk, 'primary', C.primary, C.road];
const roadCase = ['match', ['get', 'class'],
  'motorway', C.motorwayCase, 'trunk', C.trunkCase, 'primary', C.primaryCase, C.casing];

const vehicleRoads = ['match', ['get', 'class'],
  ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'], true, false];
const pathRoads = ['match', ['get', 'class'], ['path', 'track', 'steps'], true, false];

function roadLayers(group, filter) {
  const tunnel = group === 'tunnel';
  return [
    {
      id: `road-${group}-path`,
      type: 'line', source: 'osm', 'source-layer': 'road', minzoom: 14,
      filter: ['all', filter, pathRoads],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': C.path,
        'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1, 17, 2, 19, 3],
        'line-dasharray': [1.5, 1.2],
        'line-opacity': tunnel ? 0.4 : 1,
      },
    },
    {
      id: `road-${group}-casing`,
      type: 'line', source: 'osm', 'source-layer': 'road',
      filter: ['all', filter, vehicleRoads],
      layout: { 'line-cap': tunnel ? 'butt' : 'round', 'line-join': 'round', 'line-sort-key': roadClassOrder },
      paint: {
        'line-color': roadCase,
        'line-width': roadWidth(group === 'bridge' ? 1.6 : 1),
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 0.7, 0], 12, tunnel ? 0.5 : 1],
        ...(tunnel ? { 'line-dasharray': [3, 2] } : {}),
      },
    },
    {
      id: `road-${group}`,
      type: 'line', source: 'osm', 'source-layer': 'road',
      filter: ['all', filter, vehicleRoads],
      layout: { 'line-cap': 'round', 'line-join': 'round', 'line-sort-key': roadClassOrder },
      paint: {
        'line-color': tunnel ? ['match', ['get', 'class'], 'motorway', '#fbd3a5', 'trunk', '#fde2b4', 'primary', '#fdf0cc', '#f7f7f7'] : roadFill,
        'line-width': roadWidth(0),
      },
    },
  ];
}

export function buildStyle({ sources, glyphs }) {
  const notTunnelBridge = ['all', ['!=', ['get', 'tunnel'], 1], ['!=', ['get', 'bridge'], 1]];
  return {
    version: 8,
    name: 'Manila Maps Light',
    glyphs,
    light: { anchor: 'viewport', color: '#ffffff', intensity: 0.22, position: [1.2, 200, 35] },
    sources: { ...sources },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': C.land } },

      // ---- land use ----
      {
        id: 'landuse', type: 'fill', source: 'osm', 'source-layer': 'landuse',
        paint: {
          'fill-color': ['match', ['get', 'class'],
            ['park', 'garden'], C.park,
            'forest', C.forest,
            ['grass', 'golf', 'farmland'], C.grass,
            'wetland', '#d6ebe0',
            'cemetery', C.cemetery,
            'hospital', C.hospital,
            ['school', 'university'], C.school,
            ['commercial', 'retail'], C.commercial,
            'industrial', C.industrial,
            'military', C.military,
            'airport', C.airport,
            'pitch', C.pitch,
            'sand', C.sand,
            'parking', C.parking,
            'rgba(0,0,0,0)'],
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 13, 1],
        },
      },

      // ---- water ----
      {
        id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water',
        paint: { 'fill-color': C.water },
      },
      {
        id: 'waterway', type: 'line', source: 'osm', 'source-layer': 'waterway',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': C.water,
          'line-width': ['interpolate', ['exponential', 1.5], ['zoom'],
            9, ['match', ['get', 'class'], 'river', 1, 0.3],
            14, ['match', ['get', 'class'], 'river', 4, 'canal', 2.5, 1.2],
            18, ['match', ['get', 'class'], 'river', 18, 'canal', 10, 4]],
        },
      },

      // ---- aeroways ----
      {
        id: 'aeroway-area', type: 'fill', source: 'osm', 'source-layer': 'aeroway',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#e2e3ea' },
      },
      {
        id: 'aeroway-line', type: 'line', source: 'osm', 'source-layer': 'aeroway',
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': '#dcdde5',
          'line-width': ['interpolate', ['exponential', 1.6], ['zoom'],
            11, ['match', ['get', 'class'], 'runway', 2, 0.6],
            17, ['match', ['get', 'class'], 'runway', 60, 18]],
        },
      },

      // ---- flat buildings (below z15.5, cross-fading into 3D) ----
      {
        id: 'building-flat', type: 'fill', source: 'osm', 'source-layer': 'building', minzoom: 13,
        paint: {
          'fill-color': C.building,
          'fill-outline-color': C.buildingLine,
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.6, 1, 15, 1, 15.8, 0],
        },
      },

      // ---- boundaries ----
      {
        id: 'boundary-barangay', type: 'line', source: 'osm', 'source-layer': 'boundary', minzoom: 13,
        filter: ['==', ['get', 'level'], 'barangay'],
        paint: { 'line-color': C.boundary, 'line-opacity': 0.35, 'line-width': 0.8, 'line-dasharray': [2, 2] },
      },
      {
        id: 'boundary-city', type: 'line', source: 'osm', 'source-layer': 'boundary',
        filter: ['==', ['get', 'level'], 'city'],
        paint: {
          'line-color': C.boundary,
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 16, 0.4],
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 14, 1.6],
          'line-dasharray': [4, 2, 1, 2],
        },
      },

      // ---- roads: tunnels, ground, rail, bridges ----
      ...roadLayers('tunnel', ['==', ['get', 'tunnel'], 1]),
      ...roadLayers('ground', notTunnelBridge),
      {
        id: 'rail', type: 'line', source: 'osm', 'source-layer': 'rail',
        filter: ['all', ['!=', ['get', 'tunnel'], 1], ['match', ['get', 'class'], ['rail', 'tram'], true, false]],
        paint: {
          'line-color': C.rail,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.8, 16, 2.4],
        },
      },
      {
        id: 'rail-hatch', type: 'line', source: 'osm', 'source-layer': 'rail', minzoom: 14,
        filter: ['all', ['!=', ['get', 'tunnel'], 1], ['match', ['get', 'class'], ['rail', 'tram'], true, false]],
        paint: {
          'line-color': C.rail,
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 4, 18, 8],
          'line-dasharray': [0.15, 3],
        },
      },
      ...roadLayers('bridge', ['==', ['get', 'bridge'], 1]),
      {
        id: 'transit-casing', type: 'line', source: 'osm', 'source-layer': 'rail',
        filter: ['match', ['get', 'class'], ['subway', 'light_rail', 'monorail'], true, false],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-opacity': ['case', ['==', ['get', 'tunnel'], 1], 0, 0.9],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 4.5, 18, 9],
        },
      },
      {
        id: 'transit', type: 'line', source: 'osm', 'source-layer': 'rail',
        filter: ['match', ['get', 'class'], ['subway', 'light_rail', 'monorail'], true, false],
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': C.transit,
          'line-opacity': ['case', ['==', ['get', 'tunnel'], 1], 0.5, 1],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 14, 2.4, 18, 5],
        },
      },

      // ---- 3D buildings ----
      {
        id: 'building-3d', type: 'fill-extrusion', source: 'osm', 'source-layer': 'building', minzoom: 14.8,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'height'], 6],
            0, '#f1eee9', 40, '#ebe8e3', 150, '#e3e1de'],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'],
            14.8, 0, 15.6, ['coalesce', ['get', 'height'], 6]],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'],
            14.8, 0, 15.6, ['coalesce', ['get', 'min_height'], 0]],
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 14.8, 0, 15.6, 0.88],
          'fill-extrusion-vertical-gradient': true,
        },
      },

      // ---- labels ----
      {
        id: 'water-label', type: 'symbol', source: 'osm', 'source-layer': 'waterway', minzoom: 13,
        filter: ['has', 'name'],
        layout: {
          'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': FONT,
          'text-size': 11, 'symbol-spacing': 400, 'text-letter-spacing': 0.05,
        },
        paint: { 'text-color': C.waterLabel, 'text-halo-color': 'rgba(255,255,255,0.7)', 'text-halo-width': 1 },
      },
      {
        id: 'oneway', type: 'symbol', source: 'osm', 'source-layer': 'road', minzoom: 16.5,
        filter: ['all', ['has', 'oneway'], ['match', ['get', 'class'], ['primary', 'secondary', 'tertiary', 'minor', 'service', 'trunk'], true, false]],
        layout: {
          'symbol-placement': 'line', 'symbol-spacing': 140,
          'icon-image': 'oneway', 'icon-size': ['interpolate', ['linear'], ['zoom'], 16, 0.55, 19, 0.85],
          'icon-rotate': ['case', ['==', ['get', 'oneway'], -1], 180, 0],
          'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true,
        },
        paint: { 'icon-opacity': 0.55 },
      },
      {
        id: 'road-label', type: 'symbol', source: 'osm', 'source-layer': 'road', minzoom: 12,
        filter: ['all', ['has', 'name'], vehicleRoads],
        layout: {
          'symbol-placement': 'line',
          'symbol-sort-key': ['-', 10, roadClassOrder],
          'text-field': ['get', 'name'],
          'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'],
            12, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 10.5, 9.5],
            16, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary'], 13.5, 12],
            19, 15],
          'text-max-angle': 30,
          'symbol-spacing': 320,
          'text-padding': 4,
        },
        paint: { 'text-color': '#5c6066', 'text-halo-color': C.halo, 'text-halo-width': 1.6 },
      },
      {
        id: 'road-shield', type: 'symbol', source: 'osm', 'source-layer': 'road', minzoom: 10,
        filter: ['all', ['has', 'ref'], ['match', ['get', 'class'], ['motorway', 'trunk'], true, false]],
        layout: {
          'symbol-placement': 'line', 'symbol-spacing': 500,
          'text-field': ['get', 'ref'], 'text-font': FONT, 'text-size': 10,
          'text-rotation-alignment': 'viewport',
          'icon-image': 'shield', 'icon-text-fit': 'both', 'icon-text-fit-padding': [2, 4, 2, 4],
        },
        paint: { 'text-color': '#7a4b10' },
      },
      {
        id: 'building-label', type: 'symbol', source: 'osm', 'source-layer': 'building', minzoom: 17,
        filter: ['has', 'name'],
        layout: { 'text-field': ['get', 'name'], 'text-font': FONT, 'text-size': 11, 'text-max-width': 8, 'text-padding': 6 },
        paint: { 'text-color': '#8c8a85', 'text-halo-color': C.halo, 'text-halo-width': 1.2 },
      },
      {
        id: 'poi', type: 'symbol', source: 'osm', 'source-layer': 'poi', minzoom: 12,
        filter: ['all', ['has', 'name'],
          ['<=', ['coalesce', ['get', 'rank'], 99], ['step', ['zoom'], 3, 14, 6, 15, 9, 16, 12, 17, 13, 18, 16, 19, 99]]],
        layout: poiLayout(),
        paint: poiPaint(),
      },
      {
        id: 'place-minor', type: 'symbol', source: 'osm', 'source-layer': 'place', minzoom: 13,
        filter: ['match', ['get', 'class'], ['neighbourhood', 'barangay', 'village', 'locality', 'quarter'], true, false],
        layout: {
          'text-field': ['get', 'name'], 'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10.5, 17, 13],
          'text-max-width': 7, 'text-transform': 'uppercase', 'text-letter-spacing': 0.08,
          'text-padding': 8, 'symbol-sort-key': ['coalesce', ['get', 'rank'], 99],
        },
        paint: { 'text-color': '#8b8f96', 'text-halo-color': C.halo, 'text-halo-width': 1.4 },
      },
      {
        id: 'place-suburb', type: 'symbol', source: 'osm', 'source-layer': 'place', minzoom: 11, maxzoom: 16,
        filter: ['match', ['get', 'class'], ['suburb', 'town'], true, false],
        layout: {
          'text-field': ['get', 'name'], 'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 11, 15, 14],
          'text-max-width': 7, 'text-transform': 'uppercase', 'text-letter-spacing': 0.1,
          'text-padding': 6, 'symbol-sort-key': ['coalesce', ['get', 'rank'], 99],
        },
        paint: { 'text-color': '#6f747b', 'text-halo-color': C.halo, 'text-halo-width': 1.6 },
      },
      {
        id: 'place-city', type: 'symbol', source: 'osm', 'source-layer': 'place', maxzoom: 15,
        filter: ['==', ['get', 'class'], 'city'],
        layout: {
          'text-field': ['get', 'name'], 'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 13, 11, 17, 14, 20],
          'text-max-width': 8, 'text-letter-spacing': 0.02,
          'symbol-sort-key': ['coalesce', ['get', 'rank'], 99],
        },
        paint: {
          'text-color': '#2f3237', 'text-halo-color': C.halo, 'text-halo-width': 2.2,
          // Fake a heavier weight with a faint same-colour halo inside the white halo.
          'text-halo-blur': 0.4,
        },
      },
    ],
  };
}

function poiLayout() {
  return {
    'icon-image': ['concat', 'poi-', ['coalesce', ['get', 'class'], 'other']],
    'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 16, 1],
    'text-field': ['get', 'name'],
    'text-font': FONT,
    'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10.5, 17, 12],
    'text-anchor': 'left',
    'text-offset': [1.15, 0],
    'text-justify': 'left',
    'text-max-width': 8,
    'text-optional': true,
    'text-padding': 2,
    'icon-padding': 2,
    'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
    'text-radial-offset': 1.1,
    'symbol-sort-key': ['coalesce', ['get', 'rank'], 99],
  };
}

function poiPaint() {
  return {
    'text-color': ['match', ['get', 'class'],
      ['food', 'cafe', 'bar'], '#b8601a',
      ['mall', 'shop', 'supermarket', 'convenience', 'market'], '#4553c4',
      ['hospital', 'clinic', 'pharmacy'], '#c4383d',
      ['park', 'attraction', 'sports', 'gym'], '#2a7f4a',
      ['bus', 'train', 'airport', 'ferry', 'fuel', 'charging', 'parking'], '#2864b5',
      ['hotel', 'cinema'], '#a93e7b',
      ['school', 'university', 'library', 'museum'], '#86592d',
      '#5f646b'],
    'text-halo-color': C.halo,
    'text-halo-width': 1.4,
  };
}

/** Layer id before which app overlays (route line) are inserted: above roads & buildings, below labels. */
export const OVERLAY_BEFORE = 'water-label';
