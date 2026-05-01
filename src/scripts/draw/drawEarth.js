export function drawEarth(radius) {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;

  noFill();
  stroke(100, 180, 255);
  strokeWeight(1);
  circle(centerX, centerY, radius * 2);
}

export function drawEarthCenterMarker() {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;

  fill(100, 180, 255);
  noStroke();
  circle(centerX, centerY, 8);
}
