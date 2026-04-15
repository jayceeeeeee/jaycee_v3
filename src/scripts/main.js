/*
 * imports
*/

import * as consts from "./constants.js";
import * as utils from "./utils.js";

/*
 * p5 setup
*/

window.setup = function() {
  createCanvas(windowWidth, windowHeight);
}

window.draw = function() {
  background(20);
  
  // Draw earth/territory
  drawEarth();
  
  // Draw info window on top-left
  drawInfoWindow(consts.date_now, consts.humanLat, consts.humanLon);
}

window.windowResized = function() {
  resizeCanvas(windowWidth, windowHeight);
  // Recalculate territory size based on new window dimensions
  utils.updateRadiusTerritory();
}


/*
 * functions
*/

function drawInfoWindow(date_now, humanLat, humanLon) {
  const d = date_now; // Use cached constant instead of recalculating
  const pad = (n, z = 2) => String(n).padStart(z, "0");
  
  // Window properties
  const windowX = 20;
  const windowY = 20;
  const windowWidth = 350;
  const padding = 12;
  const cornerRadius = 8;
  const lineHeight = 14;
  
  // Calculate window height based on content
  const titleHeight = 18;
  const separatorHeight = 8;
  const contentHeight = lineHeight * 10; // 11 lines for all info
  const windowHeight = padding * 2 + titleHeight + separatorHeight + contentHeight;
  
  // Draw semi-transparent background panel
  fill(35, 35, 45, 220);
  stroke(130, 200, 255);
  strokeWeight(2);
  rect(windowX, windowY, windowWidth, windowHeight, cornerRadius);
  
  // Draw title
  noStroke();
  fill(130, 200, 255);
  textAlign(LEFT, TOP);
  textFont('monospace');
  textSize(15);
  textStyle(BOLD);
  text("CONSTANTS", windowX + padding, windowY + padding);
  
  // Draw separator line
  stroke(100, 150, 255, 100);
  strokeWeight(1);
  line(windowX + padding, windowY + padding + 18, windowX + windowWidth - padding, windowY + padding + 18);
  
  // Draw constants text
  textStyle(NORMAL);
  textSize(12);
  fill(200, 220, 255);
  let textY = windowY + padding + 25;
  
  // Time info
  text("Hebrew Date: " + d.day + " " + d.monthName + " (" + d.month + ") " + d.year, windowX + padding, textY);
  textY += lineHeight;
  text("Time: " + pad(d.hours) + ":" + pad(d.minutes) + ":" + pad(d.seconds) + ":" + pad(d.milliseconds), windowX + padding, textY);
  //textY += lineHeight;
  //text("Stamp: " + d.timestamp, windowX + padding, textY);
  textY += lineHeight + 5;
  
  // Space info
  text("Lat: " + humanLat.toFixed(4), windowX + padding, textY);
  textY += lineHeight;
  text("Lon: " + humanLon.toFixed(4), windowX + padding, textY);
  textY += lineHeight + 5;
  
  // Sun times
  const sunrise = d.sunrise ? new Date(d.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const sunset = d.sunset ? new Date(d.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  text("Sunrise: " + sunrise, windowX + padding, textY);
  textY += lineHeight;
  text("Sunset: " + sunset, windowX + padding, textY);
  textY += lineHeight + 5;
  
  // Kabbalistic hours
  text("Kabbalistic Hour: " + d.kabbalisticHour + "/12 (" + d.kabbalisticPeriod + ")", windowX + padding, textY);
  textY += lineHeight;
  text("Day/Night Length: " + d.dayLength + " / " + d.nightLength, windowX + padding, textY);
  textY += lineHeight;
  text("Day/Night Hour Length: " + d.dayHourLength + " / " + d.nightHourLength, windowX + padding, textY);
}

function drawEarth() {
  // Center of canvas
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  
  // Draw territory circle
  noFill();
  stroke(100, 180, 255);
  strokeWeight(2);
  circle(centerX, centerY, utils.RyōikiTenkaiPixels * 2);
  
  // Draw human at center (top-down view)
  fill(100, 180, 255);
  noStroke();
  circle(centerX, centerY, 8); // Small circle for human
}