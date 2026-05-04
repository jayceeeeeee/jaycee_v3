const panelFields = {
  time: document.getElementById("info-time"),
  hebrewDate: document.getElementById("info-hebrew-date"),
  azimuth: document.getElementById("info-azimuth"),
  sunrise: document.getElementById("info-sunrise"),
  sunset: document.getElementById("info-sunset")
};

function pad(value, size = 2) {
  return String(value).padStart(size, "0");
}

function formatClock(dateValue) {
  return dateValue
    ? new Date(dateValue).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
    : "N/A";
}

export function renderInfoPanel(dateNow, _humanLat, _humanLon, lookingAzimuthDegrees) {
  panelFields.time.textContent =
    `${pad(dateNow.hours)}:${pad(dateNow.minutes)}:${pad(dateNow.seconds)}:${pad(dateNow.milliseconds, 3)}`;
  panelFields.hebrewDate.textContent =
    `${dateNow.day} ${dateNow.monthName} (${dateNow.month}) ${dateNow.year}`;
  panelFields.azimuth.textContent = `${lookingAzimuthDegrees.toFixed(0)}\u00B0`;
  panelFields.sunrise.textContent = formatClock(dateNow.sunrise);
  panelFields.sunset.textContent = formatClock(dateNow.sunset);
}
