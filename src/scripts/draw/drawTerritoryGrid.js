import { getTerritoryGridCell, TERRITORY_GRID_SIZE } from "../state/territory.js";
import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

// Base opacity of the grid lines.
const GRID_STROKE_ALPHA = 70;

// The mask starts exactly at the territory border and continues
// beyond it for a softer fade.
const MASK_FADE_INNER_RATIO = 1.0;
const MASK_FADE_OUTER_RATIO = 1.22;

const BASE_NINE_SQUARE = [
  [1, 2, 4],
  [3, 5, 7],
  [6, 8, 9]
];

const BASE_DIAMOND_CELLS = [
  { value: 1, q: 0, r: 0 },
  { value: 2, q: 1, r: 0 },
  { value: 4, q: 2, r: 0 },
  { value: 3, q: 0, r: 1 },
  { value: 5, q: 1, r: 1 },
  { value: 7, q: 2, r: 1 },
  { value: 6, q: 0, r: 2 },
  { value: 8, q: 1, r: 2 },
  { value: 9, q: 2, r: 2 }
];

const OVERLAY_CENTER_OFFSETS = [
  [-3, -3],
  [-3, 0],
  [-3, 3],
  [0, -3],
  [0, 3],
  [3, -3],
  [3, 0],
  [3, 3]
];

const GRID_CELL_COLORS = [
  [
    [126, 197, 219],
    [235, 136, 84],
    [157, 132, 102]
  ],
  [
    [128, 168, 88],
    [214, 207, 177],
    [164, 170, 184]
  ],
  [
    [111, 115, 133],
    [86, 136, 188],
    [214, 188, 116]
  ]
];
const GRID_CELL_FILL_ALPHA = 58;
const GRID_VALUE_ALPHA = 180;
let hasLoggedOverlaySeries = false;
const DIAMOND_ROTATION_COUNT = 6;
const DIAMOND_CHAIN_OFFSETS = [
  [0, 0],
  [1, 1],
  [2, 2]
];

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

  logOverlaySeries();
  drawGridBackgrounds(startX, startY, cellSize);
  drawGridCells(startX, startY, cellSize);
  drawGridValues(startX, startY, cellSize);
  //for now it is not useful to draw the coordinates of the earth map
  //drawGridCoordinates(startX, startY, cellSize, centerLat, centerLon);
}

function drawGridBackgrounds(startX, startY, cellSize) {
  noStroke();

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;
      const cellColor = getGridCellColor(row, col);

      fill(...cellColor, GRID_CELL_FILL_ALPHA);
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

function drawGridValues(startX, startY, cellSize) {
  const canvasTheme = getCanvasTheme();
  const valueSize = cellSize < 26 ? 10 : 18;
  const computedGrid = buildComputedGrid(OVERLAY_CENTER_OFFSETS);

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      const x = startX + col * cellSize;
      const y = startY + row * cellSize;

      noStroke();
      fill(...canvasTheme.textStrong, GRID_VALUE_ALPHA);
      textSize(valueSize);
      text(String(computedGrid[row][col]), x + cellSize / 2, y + cellSize / 2 + 1);
    }
  }
}

function buildComputedGrid() {
  return buildComputedGridFromOffsets(OVERLAY_CENTER_OFFSETS);
}

function buildComputedGridFromOffsets(overlayOffsets) {
  const computedGrid = [];

  for (let row = 0; row < TERRITORY_GRID_SIZE; row += 1) {
    const computedRow = [];

    for (let col = 0; col < TERRITORY_GRID_SIZE; col += 1) {
      let overlaySum = 0;

      for (const [rowOffset, colOffset] of overlayOffsets) {
        const sourceRow = row - rowOffset;
        const sourceCol = col - colOffset;

        if (!isInsideGrid(sourceRow, sourceCol)) {
          continue;
        }

        overlaySum += getBaseGridValue(sourceRow, sourceCol);
      }

      computedRow.push(reduceDigitalRoot(overlaySum));
    }

    computedGrid.push(computedRow);
  }

  return computedGrid;
}

function logOverlaySeries() {
  if (hasLoggedOverlaySeries) {
    return;
  }

  hasLoggedOverlaySeries = true;
  const rotatedDiamondChains = buildRotatedDiamondChainOverlay(
    DIAMOND_ROTATION_COUNT,
    DIAMOND_CHAIN_OFFSETS
  );

  for (const angleOverlay of rotatedDiamondChains.angleOverlays) {
    console.log(
      `[Territory Grid] Losange diagonal 1-5-9 angle ${angleOverlay.angleIndex + 1}/${DIAMOND_ROTATION_COUNT} (sommes brutes)\n${formatHexOverlayForConsole(angleOverlay.rawSumCells)}`
    );
    console.log(
      `[Territory Grid] Losange diagonal 1-5-9 angle ${angleOverlay.angleIndex + 1}/${DIAMOND_ROTATION_COUNT} (racine digitale)\n${formatHexOverlayForConsole(angleOverlay.digitalRootCells)}`
    );
  }

  console.log(
    `[Territory Grid] Total des 6 losanges diagonaux 1-5-9 (sommes brutes)\n${formatHexOverlayForConsole(rotatedDiamondChains.totalRawSumCells)}`
  );
  console.log(
    `[Territory Grid] Total des 6 losanges diagonaux 1-5-9 (racine digitale)\n${formatHexOverlayForConsole(rotatedDiamondChains.totalDigitalRootCells)}`
  );
}

function formatGridForConsole(grid) {
  return grid.map((row) => row.join(" ")).join("\n");
}

function buildRotatedDiamondChainOverlay(rotationCount, chainOffsets) {
  const angleOverlays = [];
  const totalRawSumByCoordinate = new Map();

  for (let rotationIndex = 0; rotationIndex < rotationCount; rotationIndex += 1) {
    const angleRawSumByCoordinate = new Map();

    for (const [chainQ, chainR] of chainOffsets) {
      const [rotatedChainQ, rotatedChainR] = rotateAxialVector(chainQ, chainR, rotationIndex);

      for (const cell of BASE_DIAMOND_CELLS) {
        const rotatedCell = rotateAxialCell(cell, rotationIndex);
        const targetQ = rotatedCell.q + rotatedChainQ;
        const targetR = rotatedCell.r + rotatedChainR;
        const coordinateKey = `${targetQ},${targetR}`;

        addValueToCoordinateMap(angleRawSumByCoordinate, coordinateKey, cell.value);
        addValueToCoordinateMap(totalRawSumByCoordinate, coordinateKey, cell.value);
      }
    }

    const rawSumCells = coordinateMapToCells(angleRawSumByCoordinate);

    angleOverlays.push({
      angleIndex: rotationIndex,
      rawSumCells,
      digitalRootCells: rawSumCells.map((cell) => ({
        q: cell.q,
        r: cell.r,
        value: reduceDigitalRoot(cell.value)
      }))
    });
  }

  const totalRawSumCells = coordinateMapToCells(totalRawSumByCoordinate);

  return {
    angleOverlays,
    totalRawSumCells,
    totalDigitalRootCells: totalRawSumCells.map((cell) => ({
      q: cell.q,
      r: cell.r,
      value: reduceDigitalRoot(cell.value)
    }))
  };
}

function addValueToCoordinateMap(coordinateMap, coordinateKey, value) {
  const currentValue = coordinateMap.get(coordinateKey) ?? 0;
  coordinateMap.set(coordinateKey, currentValue + value);
}

function coordinateMapToCells(coordinateMap) {
  return Array.from(coordinateMap.entries())
    .map(([key, value]) => {
      const [q, r] = key.split(",").map(Number);

      return { q, r, value };
    })
    .sort((leftCell, rightCell) => {
      if (leftCell.r !== rightCell.r) {
        return leftCell.r - rightCell.r;
      }

      return leftCell.q - rightCell.q;
    });
}

function rotateAxialCell(cell, turns) {
  const [q, r] = rotateAxialVector(cell.q, cell.r, turns);

  return { q, r };
}

function rotateAxialVector(q, r, turns) {
  let rotatedQ = q;
  let rotatedR = r;

  for (let turn = 0; turn < turns; turn += 1) {
    [rotatedQ, rotatedR] = rotateAxial60Degrees(rotatedQ, rotatedR);
  }

  return [rotatedQ, rotatedR];
}

function rotateAxial60Degrees(q, r) {
  return [-r, q + r];
}

function formatHexOverlayForConsole(cells) {
  const projectedCells = cells.map((cell) => ({
    x: cell.q - cell.r,
    y: cell.q + cell.r,
    value: cell.value
  }));

  const minX = Math.min(...projectedCells.map((cell) => cell.x));
  const maxX = Math.max(...projectedCells.map((cell) => cell.x));
  const minY = Math.min(...projectedCells.map((cell) => cell.y));
  const maxY = Math.max(...projectedCells.map((cell) => cell.y));
  const cellMap = new Map(projectedCells.map((cell) => [`${cell.x},${cell.y}`, cell.value]));
  const rowLines = [];

  for (let y = minY; y <= maxY; y += 1) {
    const rowValues = [];

    for (let x = minX; x <= maxX; x += 1) {
      const key = `${x},${y}`;
      const cellValue = cellMap.get(key);
      rowValues.push(cellValue === undefined ? "." : String(cellValue).padStart(2, " "));
    }

    rowLines.push(rowValues.join(" "));
  }

  return rowLines.join("\n");
}

function getBaseGridValue(row, col) {
  return BASE_NINE_SQUARE[row % 3][col % 3];
}

function getGridCellColor(row, col) {
  return GRID_CELL_COLORS[row % 3][col % 3];
}

function isInsideGrid(row, col) {
  return row >= 0 && row < TERRITORY_GRID_SIZE && col >= 0 && col < TERRITORY_GRID_SIZE;
}

function reduceDigitalRoot(value) {
  if (value === 0) {
    return 0;
  }

  return ((value - 1) % 9) + 1;
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
