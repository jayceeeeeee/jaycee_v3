const TERRITORY_GRID_SIZE = 9;
const GRID_STROKE_ALPHA = 70;
const MASK_FADE_INNER_RATIO = 1.0;
const MASK_FADE_OUTER_RATIO = 1.22;
const MASK_BACKGROUND = 20;

export function drawTerritoryGrid(radius) {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const diameter = radius * 2;
  const cellSize = diameter / TERRITORY_GRID_SIZE;
  const startX = centerX - radius;
  const startY = centerY - radius;

  noFill();
  stroke(100, 180, 255, GRID_STROKE_ALPHA);
  strokeWeight(1);

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      rect(x, y, cellSize, cellSize);
    }
  }

  applyTerritoryFadeMask(centerX, centerY, radius);
}

function applyTerritoryFadeMask(centerX, centerY, radius) {
  const drawingGradient = drawingContext.createRadialGradient(
    centerX,
    centerY,
    radius * MASK_FADE_INNER_RATIO,
    centerX,
    centerY,
    radius * MASK_FADE_OUTER_RATIO
  );

  drawingGradient.addColorStop(0, `rgba(${MASK_BACKGROUND}, ${MASK_BACKGROUND}, ${MASK_BACKGROUND}, 0)`);
  drawingGradient.addColorStop(1, `rgba(${MASK_BACKGROUND}, ${MASK_BACKGROUND}, ${MASK_BACKGROUND}, 1)`);

  push();
  noStroke();
  drawingContext.fillStyle = drawingGradient;
  drawingContext.fillRect(0, 0, windowWidth, windowHeight);
  pop();
}
