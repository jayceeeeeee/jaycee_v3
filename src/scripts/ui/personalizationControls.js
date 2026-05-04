import { searchLocation } from "../lib/geocode.js";
import {
  getCurrentTimeSpace,
  setHumanCoordinates,
  setLocationQuery,
  setSelectedDate,
  updateGeolocation,
  usePresentDateTime
} from "../state/timeSpace.js";

const controlFields = {
  dateInput: document.getElementById("control-date"),
  timeSlider: document.getElementById("control-time-slider"),
  timeSliderValue: document.getElementById("control-time-slider-value"),
  latInput: document.getElementById("control-lat"),
  lonInput: document.getElementById("control-lon"),
  locationInput: document.getElementById("control-location-query"),
  dateApplyButton: document.getElementById("control-date-apply"),
  dateResetButton: document.getElementById("control-date-reset"),
  coordinatesApplyButton: document.getElementById("control-coordinates-apply"),
  locationNowButton: document.getElementById("control-location-now"),
  locationSearchButton: document.getElementById("control-location-search"),
  status: document.getElementById("control-status")
};

let lastSyncedLocationQuery = null;

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatTimeFromMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getMinutesFromDate(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function setDateTimeControls(date) {
  const minutesOfDay = getMinutesFromDate(date);
  controlFields.dateInput.value = formatDateTimeLocal(date);
  controlFields.timeSlider.value = String(minutesOfDay);
  controlFields.timeSliderValue.textContent = formatTimeFromMinutes(minutesOfDay);
}

function setStatus(message, tone = "muted") {
  controlFields.status.textContent = message;
  controlFields.status.dataset.tone = tone;
}

function syncInputsFromState() {
  const timeSpace = getCurrentTimeSpace();
  setDateTimeControls(timeSpace.selectedDate);
  controlFields.latInput.value = timeSpace.humanLat.toFixed(6);
  controlFields.lonInput.value = timeSpace.humanLon.toFixed(6);
  controlFields.locationInput.value = timeSpace.locationQuery;
  lastSyncedLocationQuery = timeSpace.locationQuery;
}

export function syncPersonalizationControlsFromState(timeSpace = getCurrentTimeSpace()) {
  const isEditingDateControls =
    document.activeElement === controlFields.dateInput ||
    document.activeElement === controlFields.timeSlider ||
    document.activeElement === controlFields.dateApplyButton;

  if (timeSpace.followsPresentTime && !isEditingDateControls) {
    setDateTimeControls(timeSpace.selectedDate);
  }

  if (document.activeElement !== controlFields.latInput) {
    controlFields.latInput.value = timeSpace.humanLat.toFixed(6);
  }

  if (document.activeElement !== controlFields.lonInput) {
    controlFields.lonInput.value = timeSpace.humanLon.toFixed(6);
  }

  const canSyncLocationQuery =
    document.activeElement !== controlFields.locationInput &&
    document.activeElement !== controlFields.locationSearchButton;

  if (canSyncLocationQuery && timeSpace.locationQuery !== lastSyncedLocationQuery) {
    controlFields.locationInput.value = timeSpace.locationQuery;
    lastSyncedLocationQuery = timeSpace.locationQuery;
  }
}

function applyDateFromInput() {
  const selectedValue = controlFields.dateInput.value;

  if (!selectedValue) {
    setStatus("Choose a date and time first.", "error");
    return;
  }

  const parsedDate = new Date(selectedValue);

  if (!setSelectedDate(parsedDate, false)) {
    setStatus("That date could not be parsed.", "error");
    return;
  }

  setDateTimeControls(parsedDate);
  setStatus("Date updated.", "success");
}

function resetDateToNow() {
  usePresentDateTime();
  syncPersonalizationControlsFromState();
  setStatus("Live present time restored.", "success");
}

function applyTimeSlider() {
  const timeSpace = getCurrentTimeSpace();
  const minutesOfDay = Number(controlFields.timeSlider.value);
  const updatedDate = new Date(timeSpace.selectedDate);
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;

  updatedDate.setHours(hours, minutes, 0, 0);

  if (!setSelectedDate(updatedDate, false)) {
    setStatus("That time could not be applied.", "error");
    return;
  }

  controlFields.dateInput.value = formatDateTimeLocal(updatedDate);
  controlFields.timeSliderValue.textContent = formatTimeFromMinutes(minutesOfDay);
  setStatus(`Time updated to ${formatTimeFromMinutes(minutesOfDay)}.`, "muted");
}

function applyCoordinatesFromInputs() {
  const lat = Number(controlFields.latInput.value);
  const lon = Number(controlFields.lonInput.value);

  if (!setHumanCoordinates(lat, lon)) {
    setStatus("Latitude must be between -90 and 90, and longitude between -180 and 180.", "error");
    return;
  }

  setLocationQuery("");
  controlFields.locationInput.value = "";
  lastSyncedLocationQuery = "";
  setStatus("Coordinates updated.", "success");
}

async function applyLocationSearch() {
  const query = controlFields.locationInput.value.trim();
  setLocationQuery(query);

  if (!query) {
    setStatus("Enter a place name first.", "error");
    return;
  }

  setStatus("Searching for location...", "muted");

  try {
    const result = await searchLocation(query);
    setHumanCoordinates(result.lat, result.lon);
    setLocationQuery(result.label);
    controlFields.locationInput.value = result.label;
    lastSyncedLocationQuery = result.label;
    controlFields.latInput.value = result.lat.toFixed(6);
    controlFields.lonInput.value = result.lon.toFixed(6);
    setStatus("Location found and applied.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function useCurrentLocation() {
  setStatus("Requesting current location...", "muted");
  const didUpdate = await updateGeolocation();

  if (!didUpdate) {
    setStatus("Current location is unavailable or permission was denied.", "error");
    return;
  }

  setLocationQuery("");
  lastSyncedLocationQuery = "";
  syncPersonalizationControlsFromState();
  setStatus("Current location applied.", "success");
}

export function initializePersonalizationControls() {
  syncInputsFromState();
  setStatus("Defaults are the present time-space.", "muted");

  controlFields.dateApplyButton.addEventListener("click", applyDateFromInput);
  controlFields.dateResetButton.addEventListener("click", resetDateToNow);
  controlFields.timeSlider.addEventListener("input", applyTimeSlider);
  controlFields.coordinatesApplyButton.addEventListener("click", applyCoordinatesFromInputs);
  controlFields.locationNowButton.addEventListener("click", useCurrentLocation);
  controlFields.locationSearchButton.addEventListener("click", applyLocationSearch);
}
