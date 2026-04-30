export function drawInfoPanel(dateNow, humanLat, humanLon, lookingAzimuthDegrees) {
  const pad = (n, z = 2) => String(n).padStart(z, "0");
  const windowX = 20;
  const windowY = 20;
  const panelWidth = 350;
  const padding = 12;
  const cornerRadius = 8;
  const lineHeight = 14;
  const titleHeight = 18;
  const separatorHeight = 8;
  const contentHeight = lineHeight * 11;
  const panelHeight = padding * 2 + titleHeight + separatorHeight + contentHeight;

  fill(35, 35, 45, 220);
  stroke(130, 200, 255);
  strokeWeight(2);
  rect(windowX, windowY, panelWidth, panelHeight, cornerRadius);

  noStroke();
  fill(130, 200, 255);
  textAlign(LEFT, TOP);
  textFont("monospace");
  textSize(15);
  textStyle(BOLD);
  text("CONSTANTS", windowX + padding, windowY + padding);

  stroke(100, 150, 255, 100);
  strokeWeight(1);
  line(windowX + padding, windowY + padding + 18, windowX + panelWidth - padding, windowY + padding + 18);

  textStyle(NORMAL);
  textSize(12);
  fill(200, 220, 255);
  let textY = windowY + padding + 25;

  text("Hebrew Date: " + dateNow.day + " " + dateNow.monthName + " (" + dateNow.month + ") " + dateNow.year, windowX + padding, textY);
  textY += lineHeight;
  text("Time: " + pad(dateNow.hours) + ":" + pad(dateNow.minutes) + ":" + pad(dateNow.seconds) + ":" + pad(dateNow.milliseconds), windowX + padding, textY);
  textY += lineHeight + 5;

  text("Lat: " + humanLat.toFixed(4), windowX + padding, textY);
  textY += lineHeight;
  text("Lon: " + humanLon.toFixed(4), windowX + padding, textY);
  textY += lineHeight;
  text("Looking Azimuth: " + lookingAzimuthDegrees.toFixed(0) + " deg", windowX + padding, textY);
  textY += lineHeight + 5;

  const sunrise = dateNow.sunrise
    ? new Date(dateNow.sunrise).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "N/A";
  const sunset = dateNow.sunset
    ? new Date(dateNow.sunset).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "N/A";
  text("Sunrise: " + sunrise, windowX + padding, textY);
  textY += lineHeight;
  text("Sunset: " + sunset, windowX + padding, textY);
  textY += lineHeight + 5;

  text("Kabbalistic Hour: " + dateNow.kabbalisticHour + "/12 (" + dateNow.kabbalisticPeriod + ")", windowX + padding, textY);
  textY += lineHeight;
  text("Day/Night Length: " + dateNow.dayLength + " / " + dateNow.nightLength, windowX + padding, textY);
  textY += lineHeight;
  text("Day/Night Hour Length: " + dateNow.dayHourLength + " / " + dateNow.nightHourLength, windowX + padding, textY);
}
