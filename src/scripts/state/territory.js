/*
 * territory state
 */

// Fixed grid resolution used by the current "world on a square" territory view.
// A 9x9 grid means 81 cells total.
export const TERRITORY_GRID_SIZE = 9;

// Mean Earth radius in meters. This is precise enough unless we later need
// ellipsoidal geodesic calculations.
const EARTH_RADIUS_METERS = 6_371_008.8;

// Quarter of Earth's circumference.
// In the earlier "local horizon" interpretation this was used as a natural
// maximum reach from the user's position to the horizon edge of the plan.
// We still keep it as the default conceptual territory size in meters.
const earthTerritoryMeters = (Math.PI * EARTH_RADIUS_METERS) / 2;

// Conceptual territory radius in meters.
// This value currently acts more as a semantic state value than as the direct
// driver of the square world-map projection below.
export let territoryMeters = earthTerritoryMeters;

// Visual radius of the circular territory drawn on screen.
export let territoryPixels = getRadiusTerritory();

// Recompute the visual radius when the viewport changes.
export function updateRadiusTerritory() {
  territoryPixels = getRadiusTerritory();
}

function getRadiusTerritory() {
  // Keep the circle proportional to the smallest viewport dimension so it
  // always remains visible no matter the screen aspect ratio.
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  return minDimension * 0.25;
}

// Getter for the conceptual territory size in meters.
export function getTerritoryMeters() {
  return territoryMeters;
}

// Setter for the conceptual territory size in meters.
export function setTerritoryMeters(value) {
  territoryMeters = value;
}

// Return all grid cells as geographic cell-center coordinates.
//
// The current model is not a true azimuthal projection. Instead, it treats the
// square as a recentered world map:
// - total width  = 360 degrees of longitude
// - total height = 180 degrees of latitude
// - the user's current position is placed at the square center
//
// Each returned item contains:
// - row / col: the cell index in the 9x9 grid
// - lat / lon: the geographic coordinates represented by that cell center
export function getTerritoryGridCells(centerLat, centerLon) {
  const cells = [];

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      cells.push(getTerritoryGridCell(row, col, centerLat, centerLon));
    }
  }

  return cells;
}

// Return the geographic coordinates represented by the center of one grid cell.
//
// Inputs:
// - row / col: the cell index inside the 9x9 grid
// - centerLat / centerLon: the geographic position that must appear at the
//   exact center of the square projection
//
// Process:
// 1. Convert the cell index into normalized square coordinates.
// 2. Interpret the square as a 360 x 180 lon/lat world domain.
// 3. Offset that world domain so the user's position becomes its center.
// 4. Normalize the result if it crosses a pole or wraps around longitude.
export function getTerritoryGridCell(row, col, centerLat, centerLon) {
  // Convert the cell indices into square-relative coordinates.
  // normalizedX:
  // - -0.5 at the far left
  // - +0.5 at the far right
  //
  // normalizedY:
  // - +0.5 at the top
  // - -0.5 at the bottom
  //
  // We add 0.5 because we want the *center* of the cell, not its top-left.
  const normalizedX = ((col + 0.5) / TERRITORY_GRID_SIZE) - 0.5;
  const normalizedY = 0.5 - ((row + 0.5) / TERRITORY_GRID_SIZE);

  // Map the normalized square to a recentered lon/lat rectangle.
  // The square covers:
  // - 360 degrees horizontally
  // - 180 degrees vertically
  //
  // So:
  // - moving by +0.5 in X corresponds to +180 degrees of longitude
  // - moving by +0.5 in Y corresponds to +90 degrees of latitude
  const rawLat = centerLat + normalizedY * 180;
  const rawLon = centerLon + normalizedX * 360;

  // Raw coordinates may exceed standard geographic ranges. Normalize them so
  // the final result remains valid as conventional latitude / longitude.
  const normalizedCoordinates = normalizeLatitudeLongitude(rawLat, rawLon);

  return {
    row,
    col,
    lat: normalizedCoordinates.lat,
    lon: normalizedCoordinates.lon
  };
}

// Project an actual geographic coordinate back into the territory square.
//
// This is the inverse companion of getTerritoryGridCell(...), used when we
// already have a real lat/lon point (for example a point on a geodesic) and we
// want to know where it should appear inside the recentered square map.
//
// Returned coordinates are normalized in square space:
// - normalizedX in roughly [-0.5, +0.5]
// - normalizedY in roughly [-0.5, +0.5]
//
// The function may return null when the latitude does not fit inside the
// current vertical window centered on centerLat.
export function projectLatLonToTerritoryMap(lat, lon, centerLat, centerLon) {
  const rawLat = lat;

  // The current square only shows latitudes within +/- 90 degrees around
  // the chosen center.
  if (rawLat < centerLat - 90 || rawLat > centerLat + 90) {
    return null;
  }

  // Recenter longitude around the chosen map center by wrapping the longitude
  // difference into [-180, 180). This directly gives the longitude copy that
  // belongs to the current 360-degree horizontal window.
  const rawLon = centerLon + wrapLongitude(lon - centerLon);

  // interval is [-0.5, +0.5] in both dimensions
  // and it will be projected onto the canva later.
  return {
    normalizedX: (rawLon - centerLon) / 360,
    normalizedY: (rawLat - centerLat) / 180
  };
}

// Normalize possibly out-of-range latitude / longitude values.
//
// Why this is needed:
// - latitude is only valid in [-90, +90]
// - longitude is usually wrapped into [-180, +180)
//
// When latitude goes beyond a pole:
// - latitude reflects back
// - longitude shifts by 180 degrees
//
// Example:
// - 100N, 20E becomes 80N, 160W
//
// This is the geographic meaning of "passing over the pole and coming back
// down on the other side of the globe".
function normalizeLatitudeLongitude(lat, lon) {
  let normalizedLat = lat;
  let normalizedLon = lon;

  // Reflect across the north pole until latitude is valid again.
  while (normalizedLat > 90) {
    normalizedLat = 180 - normalizedLat;
    normalizedLon += 180;
  }

  // Reflect across the south pole until latitude is valid again.
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
  // Wrap any longitude into the standard geographic interval [-180, 180).
  // This keeps east/west values canonical even after adding or subtracting
  // full turns of 360 degrees.
  return ((lon + 180) % 360 + 360) % 360 - 180;
}
