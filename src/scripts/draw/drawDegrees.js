export function drawDegrees(radius) {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const textRadius = radius - 17;
  const tickLength = 6;
  const smallTickLength = 3;

  fill(100, 180, 220, 120);
  textFont("monospace");
  textSize(9);
  textAlign(CENTER, CENTER);

  stroke(100, 180, 220, 60);
  strokeWeight(1);
  for (let deg = 0; deg < 360; deg += 1) {
    const angleRad = radians(deg - 90);
    const x1 = centerX + cos(angleRad) * radius;
    const y1 = centerY + sin(angleRad) * radius;
    const x2 = centerX + cos(angleRad) * (radius - smallTickLength);
    const y2 = centerY + sin(angleRad) * (radius - smallTickLength);
    line(x1, y1, x2, y2);
  }

  for (let deg = 0; deg < 360; deg += 10) {
    const angleRad = radians(deg - 90);

    stroke(100, 180, 220, 120);
    strokeWeight(1);
    const x1 = centerX + cos(angleRad) * radius;
    const y1 = centerY + sin(angleRad) * radius;
    const x2 = centerX + cos(angleRad) * (radius - tickLength);
    const y2 = centerY + sin(angleRad) * (radius - tickLength);
    line(x1, y1, x2, y2);

    noStroke();
    const x = centerX + cos(angleRad) * textRadius;
    const y = centerY + sin(angleRad) * textRadius;
    text(`${deg}°`, x, y);
  }
}
