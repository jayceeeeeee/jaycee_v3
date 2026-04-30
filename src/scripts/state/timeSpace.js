import { getKabbalahDateTime } from "../lib/time.js";

/*
 * space state
 */

//we use direct Seoul location for now
export let humanLat = 37.5665;
export let humanLon = 126.9780;

// True azimuth in degrees. 0 means facing true north.
// For now we cannot know where we are looking, so we fix it to the north.
let lookingAzimuthDegrees = 0;

/*
 * time state
 */

let dateNow = getKabbalahDateTime(new Date(), humanLat, humanLon);

export function getCurrentTimeSpace() {
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
