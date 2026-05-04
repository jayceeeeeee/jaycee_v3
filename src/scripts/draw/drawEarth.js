import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";

export function drawEarth(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);

  noFill();
  stroke(100, 180, 255);
  strokeWeight(1);
  circle(centerX, centerY, radius * 2);
}

export function drawEarthCenterMarker() {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);

  fill(100, 180, 255);
  noStroke();
  circle(centerX, centerY, 8);
}
