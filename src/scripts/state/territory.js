/*
 * territory state
 */

// The grid is always 9 by 9 for now.
export const TERRITORY_GRID_SIZE = 9;

// Mean Earth radius in meters. This is precise enough unless we later need
// ellipsoidal geodesic calculations.
const EARTH_RADIUS_METERS = 6_371_008.8;

// Quarter of the circumference of the Earth: pi * R / 2.
const earthTerritoryMeters = (Math.PI * EARTH_RADIUS_METERS) / 2;

// This is our default conceptual territory size in meters.
// Here we keep a simple spherical value rather than a more physical ground distance.
export let territoryMeters = earthTerritoryMeters;

// Visual radius of the territory circle on screen.
export let territoryPixels = getRadiusTerritory();

export function updateRadiusTerritory() {
  territoryPixels = getRadiusTerritory();
}

function getRadiusTerritory() {
  // The territory circle scales from the smallest viewport dimension
  // so it always stays visible on screen.
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  return minDimension * 0.25;
}

export function getTerritoryMeters() {
  return territoryMeters;
}

export function setTerritoryMeters(value) {
  territoryMeters = value;
}

export function getTerritoryGridCells(centerLat, centerLon) {
  const cells = [];

  // Build the full 9x9 geographic grid so other parts of the app
  // can consume all cells at once.
  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      cells.push(getTerritoryGridCell(row, col, centerLat, centerLon));
    }
  }

  return cells;
}

export function getTerritoryGridCell(row, col, centerLat, centerLon) {
  // Convert the grid indices into normalized coordinates inside the square:
  // x goes from -0.5 (left edge) to +0.5 (right edge)
  // y goes from +0.5 (top edge) to -0.5 (bottom edge)
  // We use +0.5 cell offsets because we want the center of each cell.
  const normalizedX = ((col + 0.5) / TERRITORY_GRID_SIZE) - 0.5;
  const normalizedY = 0.5 - ((row + 0.5) / TERRITORY_GRID_SIZE);

  // Our current model maps the full square to a full world map:
  // full width = 360 degrees of longitude
  // full height = 180 degrees of latitude
  // The user's own position is the center of that square.
  const rawLat = centerLat + normalizedY * 180;
  const rawLon = centerLon + normalizedX * 360;

  // If we crossed a pole or the date line, bring the coordinates
  // back into standard geographic ranges.
  const normalizedCoordinates = normalizeLatitudeLongitude(rawLat, rawLon);

  return {
    row,
    col,
    lat: normalizedCoordinates.lat,
    lon: normalizedCoordinates.lon
  };
}

function normalizeLatitudeLongitude(lat, lon) {
  let normalizedLat = lat;
  let normalizedLon = lon;

  // If we go past the north pole, latitude reflects back downward
  // and longitude flips by 180 degrees because we are now on the
  // opposite meridian.
  while (normalizedLat > 90) {
    normalizedLat = 180 - normalizedLat;
    normalizedLon += 180;
  }

  // Same idea when we go past the south pole.
  while (normalizedLat < -90) {
    normalizedLat = -180 - normalizedLat;
    normalizedLon += 180;
  }

  return {
    lat: normalizedLat,
    lon: wrapLongitude(normalizedLon)
  };
}

function wrapLongitude(lon) {
  // Bring any longitude back into the standard [-180, 180] interval.
  return ((lon + 180) % 360 + 360) % 360 - 180;
}
