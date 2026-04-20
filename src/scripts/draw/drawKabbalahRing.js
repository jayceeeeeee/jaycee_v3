import { sephiroth } from "../data/sephiroth.js";

export function drawKabbalahRing(innerRadius) {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const margin = 40;
  const radius = innerRadius + margin;
  const boundaries = sephiroth.map((item) => item.deg);

  noFill();
  stroke(100, 180, 255, 150);
  strokeWeight(1);
  circle(centerX, centerY, radius * 2);

  stroke(100, 180, 255, 100);
  strokeWeight(1);
  for (const boundary of boundaries) {
    const angleRad = radians(boundary - 110);
    const x1 = centerX + cos(angleRad) * innerRadius;
    const y1 = centerY + sin(angleRad) * innerRadius;
    const x2 = centerX + cos(angleRad) * radius;
    const y2 = centerY + sin(angleRad) * radius;
    line(x1, y1, x2, y2);
  }

  textFont("monospace");
  textSize(10);
  for (const item of sephiroth) {
    const angleRad = radians(item.deg - 90);
    const tickInner = innerRadius;
    const tickOuter = radius - (margin - margin / 6);
    const tx1 = centerX + cos(angleRad) * tickInner;
    const ty1 = centerY + sin(angleRad) * tickInner;
    const tx2 = centerX + cos(angleRad) * tickOuter;
    const ty2 = centerY + sin(angleRad) * tickOuter;
    stroke(130, 200, 255, 180);
    strokeWeight(1);
    line(tx1, ty1, tx2, ty2);

    fill(200, 220, 255);
    noStroke();
    const textRadius = innerRadius + margin * 0.55;
    const textX = centerX + cos(angleRad) * textRadius;
    const textY = centerY + sin(angleRad) * textRadius;
    textAlign(CENTER, CENTER);
    textSize(12);
    text(item.num, textX, textY);
  }
}
