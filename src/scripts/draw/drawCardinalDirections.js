import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";

const CARDINALS = [
  { label: "N", azimuthDegrees: 0 },
  { label: "E", azimuthDegrees: 90 },
  { label: "S", azimuthDegrees: 180 },
  { label: "W", azimuthDegrees: 270 }
];

export function drawCardinalDirections(radius, lookingAzimuthDegrees) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const labelRadius = radius - 18;
  const arrowBaseRadius = radius - 9;
  const arrowTipRadius = radius - 2;
  const arrowWingRadius = radius - 6;

  textFont("monospace");
  textAlign(CENTER, CENTER);
  textSize(13);

  for (const cardinal of CARDINALS) {
    const relativeAzimuthDegrees = normalizeDegrees(cardinal.azimuthDegrees - lookingAzimuthDegrees);
    const angleRadians = radians(relativeAzimuthDegrees - 90);
    const x = centerX + cos(angleRadians) * labelRadius;
    const y = centerY + sin(angleRadians) * labelRadius;

    drawCompassArrow(
      centerX,
      centerY,
      angleRadians,
      arrowBaseRadius,
      arrowTipRadius,
      arrowWingRadius
    );

    noStroke();
    fill(200, 230, 255, 180);
    text(cardinal.label, x, y);
  }
}

function drawCompassArrow(centerX, centerY, angleRadians, baseRadius, tipRadius, wingRadius) {
  const tipX = centerX + cos(angleRadians) * tipRadius;
  const tipY = centerY + sin(angleRadians) * tipRadius;
  const baseX = centerX + cos(angleRadians) * baseRadius;
  const baseY = centerY + sin(angleRadians) * baseRadius;
  const wingSpreadRadians = radians(8);
  const leftWingX = centerX + cos(angleRadians - wingSpreadRadians) * wingRadius;
  const leftWingY = centerY + sin(angleRadians - wingSpreadRadians) * wingRadius;
  const rightWingX = centerX + cos(angleRadians + wingSpreadRadians) * wingRadius;
  const rightWingY = centerY + sin(angleRadians + wingSpreadRadians) * wingRadius;

  stroke(130, 210, 255, 150);
  strokeWeight(0.9);
  line(baseX, baseY, tipX, tipY);

  noStroke();
  fill(130, 210, 255, 130);
  triangle(tipX, tipY, leftWingX, leftWingY, rightWingX, rightWingY);
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}
