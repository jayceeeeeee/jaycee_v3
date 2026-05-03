import { drawCardinalDirections } from "./draw/drawCardinalDirections.js";
import { drawDegrees } from "./draw/drawDegrees.js";
import { drawEarth, drawEarthCenterMarker } from "./draw/drawEarth.js";
import { drawKabbalahRing } from "./draw/drawKabbalahRing.js";
import { drawSunProjection } from "./draw/drawSunProjection.js";
import { applyTerritoryFadeMask, drawTerritoryGrid } from "./draw/drawTerritoryGrid.js";
import { drawTimeRing } from "./draw/drawTimeRing.js";
import { territoryPixels, updateRadiusTerritory } from "./state/territory.js";
import { getCurrentTimeSpace, getLookingAzimuthDegrees } from "./state/timeSpace.js";
import { initializePanelToggle } from "./ui/panelToggle.js";
import { renderInfoPanel } from "./ui/renderInfoPanel.js";

function getCanvasContainer() {
  return document.getElementById("canvas-container");
}

function getCanvasSize() {
  const container = getCanvasContainer();

  return {
    width: container.clientWidth,
    height: container.clientHeight
  };
}

window.setup = function () {
  const canvasSize = getCanvasSize();
  const canvas = createCanvas(canvasSize.width, canvasSize.height);
  canvas.parent("canvas-container");
  updateRadiusTerritory(canvasSize.width, canvasSize.height);
  initializePanelToggle();
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
  renderInfoPanel(timeSpace.dateNow, timeSpace.humanLat, timeSpace.humanLon, lookingAzimuthDegrees);
};

window.windowResized = function () {
  const canvasSize = getCanvasSize();
  resizeCanvas(canvasSize.width, canvasSize.height);
  updateRadiusTerritory(canvasSize.width, canvasSize.height);
};
