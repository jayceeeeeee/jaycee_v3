import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

export function drawTimeRing(innerRadius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const canvasTheme = getCanvasTheme();
  const kabbalahMargin = 40;
  const timeMargin = 40;
  const innerTimeRadius = innerRadius + kabbalahMargin;
  const radius = innerTimeRadius + timeMargin;

  noFill();
  stroke(...canvasTheme.accent, 100);
  strokeWeight(1);
  circle(centerX, centerY, radius * 2);

  textFont("monospace");
  textSize(9);
  fill(...canvasTheme.text);

  for (let deg = 0; deg < 360; deg += 20) {
    const angleRad = radians(deg - 90);
    const totalMinutes = Math.round((deg / 360) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const timeStr = String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");

    const tickInner = innerTimeRadius + 1;
    const tickOuter = radius - (timeMargin - timeMargin / 6);
    const tx1 = centerX + cos(angleRad) * tickInner;
    const ty1 = centerY + sin(angleRad) * tickInner;
    const tx2 = centerX + cos(angleRad) * tickOuter;
    const ty2 = centerY + sin(angleRad) * tickOuter;
    stroke(...canvasTheme.accentBright, 150);
    strokeWeight(1);
    line(tx1, ty1, tx2, ty2);

    noStroke();
    const textRadius = innerTimeRadius + timeMargin * 0.55;
    const textX = centerX + cos(angleRad) * textRadius;
    const textY = centerY + sin(angleRad) * textRadius;
    textAlign(CENTER, CENTER);
    text(timeStr, textX, textY);
  }
}
