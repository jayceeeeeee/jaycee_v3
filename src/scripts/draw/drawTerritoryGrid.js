import { getTerritoryGridCell, TERRITORY_GRID_SIZE } from "../state/territory.js";

// Base opacity of the grid lines.
const GRID_STROKE_ALPHA = 70;

// The mask starts exactly at the territory border and continues
// beyond it for a softer fade.
const MASK_FADE_INNER_RATIO = 1.0;
const MASK_FADE_OUTER_RATIO = 1.22;

// Same dark background color as the sketch, used by the radial mask.
const MASK_BACKGROUND = 20;

export function drawTerritoryGrid(radius, centerLat, centerLon) {
  const centerX = windowWidth / 2;
  const centerY = windowHeight / 2;
  const diameter = radius * 2;

  // The square grid spans the full diameter of the territory circle.
  const cellSize = diameter / TERRITORY_GRID_SIZE;
  const startX = centerX - radius;
  const startY = centerY - radius;

  noFill();
  stroke(100, 180, 255, GRID_STROKE_ALPHA);
  strokeWeight(1);
  textFont("monospace");
  textAlign(CENTER, CENTER);
  textSize(7);

  drawGridCells(startX, startY, cellSize);
  drawGridCoordinates(startX, startY, cellSize, centerLat, centerLon);

  // Finally soften everything near and beyond the circle edge.
  applyTerritoryFadeMask(centerX, centerY, radius);
}

function drawGridCells(startX, startY, cellSize) {
  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      rect(x, y, cellSize, cellSize);
    }
  }
}

function drawGridCoordinates(startX, startY, cellSize, centerLat, centerLon) {
  noStroke();
  fill(180, 220, 255, 110);

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      // Resolve the geographic center represented by this visual cell.
      const cell = getTerritoryGridCell(row, col, centerLat, centerLon);

      text(
        `${formatCoordinate(cell.lat, "N", "S")}\n${formatCoordinate(cell.lon, "E", "W")}`,
        x + cellSize / 2,
        y + cellSize / 2
      );
    }
  }
}

// Build a radial gradient that stays transparent inside the circle
// and gradually blends back to the sketch background outside it.
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

// Format the lat and lon with cardinal directions depending on if it is negative or positive.
function formatCoordinate(value, positiveLabel, negativeLabel) {
  const direction = value >= 0 ? positiveLabel : negativeLabel;
  return `${Math.abs(value).toFixed(0)}${direction}`;
}
