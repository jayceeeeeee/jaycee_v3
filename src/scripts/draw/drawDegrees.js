import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

export function drawDegrees(radius) {
  const { centerX, centerY, availableWidth, availableHeight } = getSketchLayoutMetrics(width, height);
  const canvasTheme = getCanvasTheme();
  const minAvailableDimension = Math.min(availableWidth, availableHeight);
  const isCompactViewport = minAvailableDimension < 520;
  const textRadius = radius - 17;
  const tickLength = isCompactViewport ? 4 : 6;
  const smallTickLength = isCompactViewport ? 2 : 3;
  const labelSize = isCompactViewport ? 6 : 9;
  const labelStep = isCompactViewport ? 20 : 10;

  fill(...canvasTheme.accentSoft, 120);
  textFont("monospace");
  textSize(labelSize);
  textAlign(CENTER, CENTER);

  stroke(...canvasTheme.accentSoft, 60);
  strokeWeight(1);
  for (let deg = 0; deg < 360; deg += 1) {
    const angleRad = radians(deg - 90);
    const x1 = centerX + cos(angleRad) * radius;
    const y1 = centerY + sin(angleRad) * radius;
    const x2 = centerX + cos(angleRad) * (radius - smallTickLength);
    const y2 = centerY + sin(angleRad) * (radius - smallTickLength);
    line(x1, y1, x2, y2);
  }

  for (let deg = 0; deg < 360; deg += labelStep) {
    const angleRad = radians(deg - 90);

    stroke(...canvasTheme.accentSoft, 120);
    strokeWeight(1);
    const x1 = centerX + cos(angleRad) * radius;
    const y1 = centerY + sin(angleRad) * radius;
    const x2 = centerX + cos(angleRad) * (radius - tickLength);
    const y2 = centerY + sin(angleRad) * (radius - tickLength);
    line(x1, y1, x2, y2);

    noStroke();
    const x = centerX + cos(angleRad) * textRadius;
    const y = centerY + sin(angleRad) * textRadius;
    text(`${deg}\u00B0`, x, y);
  }
}
