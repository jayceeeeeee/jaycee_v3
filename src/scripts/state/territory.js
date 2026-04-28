/*
 * territory state
 */

// Mean Earth radius in meters. This is precise enough unless we later need
// ellipsoidal geodesic calculations.
const EARTH_RADIUS_METERS = 6_371_008.8;

// Quarter of the circumference of the Earth: pi * R / 2.
const earthTerritoryMeters = (Math.PI * EARTH_RADIUS_METERS) / 2;

// Does not take the curvature into account because it is a radius
// and anyway we want the horizon plan so we don't need that, curvature will be projected in Azimuth
export let territoryMeters = earthTerritoryMeters;
export let territoryPixels = getRadiusTerritory();

export function updateRadiusTerritory() {
  territoryPixels = getRadiusTerritory();
}

function getRadiusTerritory() {
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  return minDimension * 0.25;
}

export function getTerritoryMeters() {
  return territoryMeters;
}

export function setTerritoryMeters(value) {
  territoryMeters = value;
}
