const TERRITORY_GRID_SIZE = 9;
const GRID_SAMPLE_OFFSETS = [0.15, 0.5, 0.85];

export function drawTerritoryGrid(radius) {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const diameter = radius * 2;
  const cellSize = diameter / TERRITORY_GRID_SIZE;
  const startX = centerX - radius;
  const startY = centerY - radius;

  noFill();
  strokeWeight(1);

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      const visibility = getCellVisibility(x, y, cellSize, centerX, centerY, radius);

      if (visibility <= 0) {
        continue;
      }

      const alpha = map(visibility, 0, 1, 12, 95);
      stroke(100, 180, 255, alpha);
      rect(x, y, cellSize, cellSize);
    }
  }
}

function getCellVisibility(x, y, cellSize, centerX, centerY, radius) {
  let visibleSamples = 0;
  const totalSamples = GRID_SAMPLE_OFFSETS.length ** 2;

  for (const offsetY of GRID_SAMPLE_OFFSETS) {
    for (const offsetX of GRID_SAMPLE_OFFSETS) {
      const sampleX = x + cellSize * offsetX;
      const sampleY = y + cellSize * offsetY;
      const distanceToCenter = dist(sampleX, sampleY, centerX, centerY);

      if (distanceToCenter <= radius) {
        visibleSamples += 1;
      }
    }
  }

  return visibleSamples / totalSamples;
}
