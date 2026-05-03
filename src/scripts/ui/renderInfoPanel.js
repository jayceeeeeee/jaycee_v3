const panelFields = {
  hebrewDate: document.getElementById("info-hebrew-date"),
  date: document.getElementById("info-date"),
  time: document.getElementById("info-time"),
  lat: document.getElementById("info-lat"),
  lon: document.getElementById("info-lon"),
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

export function renderInfoPanel(dateNow, humanLat, humanLon, lookingAzimuthDegrees) {
  const gregorianDate = new Date(dateNow.timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  panelFields.hebrewDate.textContent =
    `${dateNow.day} ${dateNow.monthName} (${dateNow.month}) ${dateNow.year}`;
  panelFields.date.textContent = gregorianDate;
  panelFields.time.textContent =
    `${pad(dateNow.hours)}:${pad(dateNow.minutes)}:${pad(dateNow.seconds)}:${pad(dateNow.milliseconds, 3)}`;
  panelFields.lat.textContent = humanLat.toFixed(4);
  panelFields.lon.textContent = humanLon.toFixed(4);
  panelFields.azimuth.textContent = `${lookingAzimuthDegrees.toFixed(0)}\u00B0`;
  panelFields.sunrise.textContent = formatClock(dateNow.sunrise);
  panelFields.sunset.textContent = formatClock(dateNow.sunset);
}
