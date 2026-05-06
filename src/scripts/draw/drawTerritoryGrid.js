import { getTerritoryGridCell, TERRITORY_GRID_SIZE } from "../state/territory.js";
import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

// Base opacity of the grid lines.
const GRID_STROKE_ALPHA = 70;

// The mask starts exactly at the territory border and continues
// beyond it for a softer fade.
const MASK_FADE_INNER_RATIO = 1.0;
const MASK_FADE_OUTER_RATIO = 1.22;

const GRID_CELL_LAYOUT = [
  [
    { trigram: "\u2634", color: [126, 197, 219] },
    { trigram: "\u2632", color: [235, 136, 84] },
    { trigram: "\u2637", color: [157, 132, 102] }
  ],
  [
    { trigram: "\u2633", color: [128, 168, 88] },
    { trigram: "", color: [214, 207, 177] },
    { trigram: "\u2631", color: [164, 170, 184] }
  ],
  [
    { trigram: "\u2636", color: [111, 115, 133] },
    { trigram: "\u2635", color: [86, 136, 188] },
    { trigram: "\u2630", color: [214, 188, 116] }
  ]
];
const GRID_CELL_FILL_ALPHA = 58;
const GRID_TRIGRAM_ALPHA = 180;

export function drawTerritoryGrid(radius, centerLat, centerLon) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const diameter = radius * 2;

  // The square grid spans the full diameter of the territory circle.
  const cellSize = diameter / TERRITORY_GRID_SIZE;
  const startX = centerX - radius;
  const startY = centerY - radius;

  noFill();
  textFont("monospace");
  textAlign(CENTER, CENTER);
  textSize(7);

  drawGridBackgrounds(startX, startY, cellSize);
  drawGridCells(startX, startY, cellSize);
  drawGridTrigrams(startX, startY, cellSize);
  //for now it is not useful to draw the coordinates of the earth map
  //drawGridCoordinates(startX, startY, cellSize, centerLat, centerLon);
}

function drawGridBackgrounds(startX, startY, cellSize) {
  noStroke();

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      const gridCell = getGridCellStyle(row, col);

      fill(...gridCell.color, GRID_CELL_FILL_ALPHA);
      rect(x, y, cellSize, cellSize);
    }
  }
}

function drawGridCells(startX, startY, cellSize) {
  const canvasTheme = getCanvasTheme();

  noFill();
  stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  strokeWeight(1);

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      rect(x, y, cellSize, cellSize);
    }
  }
}

function drawGridTrigrams(startX, startY, cellSize) {
  const canvasTheme = getCanvasTheme();
  const trigramSize = cellSize < 26 ? 11 : 18;

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      const gridCell = getGridCellStyle(row, col);

      if (!gridCell.trigram) {
        continue;
      }

      noStroke();
      fill(...canvasTheme.textStrong, GRID_TRIGRAM_ALPHA);
      textSize(trigramSize);
      text(gridCell.trigram, x + cellSize / 2, y + cellSize / 2 + 1);
    }
  }
}

function getGridCellStyle(row, col) {
  return GRID_CELL_LAYOUT[row % 3][col % 3];
}

function drawGridCoordinates(startX, startY, cellSize, centerLat, centerLon) {
  const canvasTheme = getCanvasTheme();

  noStroke();
  fill(...canvasTheme.text, 110);

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
export function applyTerritoryFadeMask(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const canvasTheme = getCanvasTheme();
  const drawingGradient = drawingContext.createRadialGradient(
    centerX,
    centerY,
    radius * MASK_FADE_INNER_RATIO,
    centerX,
    centerY,
    radius * MASK_FADE_OUTER_RATIO
  );

  drawingGradient.addColorStop(
    0,
    `rgba(${canvasTheme.maskBackground}, ${canvasTheme.maskBackground}, ${canvasTheme.maskBackground}, 0)`
  );
  drawingGradient.addColorStop(
    1,
    `rgba(${canvasTheme.maskBackground}, ${canvasTheme.maskBackground}, ${canvasTheme.maskBackground}, 1)`
  );

  push();
  noStroke();
  drawingContext.fillStyle = drawingGradient;
  drawingContext.fillRect(0, 0, width, height);
  pop();
}

// Format the lat and lon with cardinal directions depending on if it is negative or positive.
function formatCoordinate(value, positiveLabel, negativeLabel) {
  const direction = value >= 0 ? positiveLabel : negativeLabel;
  return `${Math.abs(value).toFixed(0)}${direction}`;
}
