import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

export function drawEarth(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const canvasTheme = getCanvasTheme();

  noFill();
  stroke(...canvasTheme.accent);
  strokeWeight(1);
  circle(centerX, centerY, radius * 2);
}

export function drawEarthCenterMarker() {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const canvasTheme = getCanvasTheme();

  fill(...canvasTheme.accent);
  noStroke();
  circle(centerX, centerY, 8);
}
