import { drawDegrees } from "./draw/drawDegrees.js";
import { drawEarth } from "./draw/drawEarth.js";
import { drawInfoPanel } from "./draw/drawInfoPanel.js";
import { drawKabbalahRing } from "./draw/drawKabbalahRing.js";
import { drawTimeRing } from "./draw/drawTimeRing.js";
import { ryoikiTenkaiPixels, updateRadiusTerritory } from "./state/territory.js";
import { getCurrentTimeSpace, updateGeolocation } from "./state/timeSpace.js";

window.setup = function () {
  createCanvas(windowWidth, windowHeight);
  updateGeolocation();
};

window.draw = function () {
  const timeSpace = getCurrentTimeSpace();

  background(20);
  drawEarth(ryoikiTenkaiPixels);
  drawKabbalahRing(ryoikiTenkaiPixels);
  drawTimeRing(ryoikiTenkaiPixels);
  drawDegrees(ryoikiTenkaiPixels);
  drawInfoPanel(timeSpace.dateNow, timeSpace.humanLat, timeSpace.humanLon);
};

window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
  updateRadiusTerritory();
};
