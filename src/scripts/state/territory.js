/*
 * territory state
 */

export let ryoikiTenkaiMeters = 10;
export let ryoikiTenkaiPixels = getRadiusTerritory();

export function updateRadiusTerritory() {
  ryoikiTenkaiPixels = getRadiusTerritory();
}

function getRadiusTerritory() {
  const minDimension = Math.min(window.innerWidth, window.innerHeight);
  return minDimension * 0.25;
}
