import { getKabbalahDateTime } from "../lib/time.js";

/*
 * space state
 */

//we use direct Seoul location for now
/*export let humanLat = 37.5665;
export let humanLon = 126.9780;*/
// Japan Sapporo
const DEFAULT_HUMAN_LAT = 43.0620958;
const DEFAULT_HUMAN_LON = 141.3543763;

export let humanLat = DEFAULT_HUMAN_LAT;
export let humanLon = DEFAULT_HUMAN_LON;

// True azimuth in degrees. 0 means facing true north.
// For now we cannot know where we are looking, so we fix it to the north.
let lookingAzimuthDegrees = 0;

/*
 * time state
 */

let selectedDate = new Date();
let followsPresentTime = true;
let locationQuery = "";
let dateNow = getKabbalahDateTime(selectedDate, humanLat, humanLon);

function refreshDateNow() {
  dateNow = getKabbalahDateTime(selectedDate, humanLat, humanLon);
}

function refreshPresentTimeIfNeeded() {
  if (!followsPresentTime) {
    return;
  }

  selectedDate = new Date();
  refreshDateNow();
}

export function getCurrentTimeSpace() {
  refreshPresentTimeIfNeeded();

  return {
    humanLat,
    humanLon,
    lookingAzimuthDegrees,
    dateNow,
    selectedDate,
    locationQuery,
    followsPresentTime
  };
}

export function getLookingAzimuthDegrees() {
  return lookingAzimuthDegrees;
}

export function setLookingAzimuthDegrees(value) {
  lookingAzimuthDegrees = value;
}

export function setSelectedDate(date, shouldFollowPresentTime = false) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }

  selectedDate = date;
  followsPresentTime = shouldFollowPresentTime;
  refreshDateNow();
  return true;
}

export function usePresentDateTime() {
  return setSelectedDate(new Date(), true);
}

export function setHumanCoordinates(lat, lon) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return false;
  }

  humanLat = lat;
  humanLon = lon;
  refreshDateNow();
  return true;
}

export function setLocationQuery(value) {
  locationQuery = value;
}

export function updateGeolocation() {
  if (!navigator.geolocation) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      humanLat = position.coords.latitude;
      humanLon = position.coords.longitude;
      refreshPresentTimeIfNeeded();
      refreshDateNow();
      resolve(true);
    }, () => {
      resolve(false);
    });
  });
}
