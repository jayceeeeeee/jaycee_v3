import { getKabbalahDateTime } from "../lib/time.js";

/*
 * space state
 */

//we use direct Seoul location for now
/*export let humanLat = 37.5665;
export let humanLon = 126.9780;*/
// Japan Sapporo
export let humanLat = 43.0620958;
export let humanLon = 141.3543763;

// True azimuth in degrees. 0 means facing true north.
// For now we cannot know where we are looking, so we fix it to the north.
let lookingAzimuthDegrees = 0;

/*
 * time state
 */

// Date of now
let dateNow = getKabbalahDateTime(new Date(), humanLat, humanLon);
// Custom date if needed
//let dateNow = getKabbalahDateTime(new Date(2026, 4, 1, 13, 40, 0), humanLat, humanLon);

export function getCurrentTimeSpace() {
  // If we want to display in real time
  //dateNow = getKabbalahDateTime(new Date(), humanLat, humanLon);

  return {
    humanLat,
    humanLon,
    lookingAzimuthDegrees,
    dateNow
  };
}

export function getLookingAzimuthDegrees() {
  return lookingAzimuthDegrees;
}

export function setLookingAzimuthDegrees(value) {
  lookingAzimuthDegrees = value;
}

export function updateGeolocation() {
  if (!navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    humanLat = position.coords.latitude;
    humanLon = position.coords.longitude;
    dateNow = getKabbalahDateTime(new Date(), humanLat, humanLon);
  });
}
