import { drawCardinalDirections } from "./draw/drawCardinalDirections.js";
import { drawDegrees } from "./draw/drawDegrees.js";
import { drawEarth, drawEarthCenterMarker } from "./draw/drawEarth.js";
import { drawInfoPanel } from "./draw/drawInfoPanel.js";
import { drawKabbalahRing } from "./draw/drawKabbalahRing.js";
import { drawSunProjection } from "./draw/drawSunProjection.js";
import { applyTerritoryFadeMask, drawTerritoryGrid } from "./draw/drawTerritoryGrid.js";
import { drawTimeRing } from "./draw/drawTimeRing.js";
import { territoryPixels, updateRadiusTerritory } from "./state/territory.js";
import { getCurrentTimeSpace, getLookingAzimuthDegrees, updateGeolocation } from "./state/timeSpace.js";

window.setup = function () {
  createCanvas(windowWidth, windowHeight);
  //updateGeolocation();
};

window.draw = function () {
  const timeSpace = getCurrentTimeSpace();
  const lookingAzimuthDegrees = getLookingAzimuthDegrees();

  background(20);
  drawTerritoryGrid(territoryPixels, timeSpace.humanLat, timeSpace.humanLon);
  drawEarth(territoryPixels);
  drawSunProjection(territoryPixels, timeSpace.dateNow, timeSpace.humanLat, timeSpace.humanLon);
  applyTerritoryFadeMask(territoryPixels);
  drawCardinalDirections(territoryPixels, lookingAzimuthDegrees);
  drawKabbalahRing(territoryPixels);
  drawTimeRing(territoryPixels);
  drawDegrees(territoryPixels);
  drawEarthCenterMarker();
  drawInfoPanel(timeSpace.dateNow, timeSpace.humanLat, timeSpace.humanLon, lookingAzimuthDegrees);
};

window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
  updateRadiusTerritory();
};
