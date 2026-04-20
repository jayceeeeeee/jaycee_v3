import { getKabbalahDateTime } from "../lib/time.js";

/*
 * space state
 */

//we use direct Seoul location for now
export let humanLat = 37.5665;
export let humanLon = 126.9780;

/*
 * time state
 */

let dateNow = getKabbalahDateTime(new Date(), humanLat, humanLon);

export function getCurrentTimeSpace() {
  return {
    humanLat,
    humanLon,
    dateNow
  };
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
