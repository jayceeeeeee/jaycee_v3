import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

// Base opacity of the grid lines.
const GRID_STROKE_ALPHA = 70;

// The mask starts exactly at the territory border and continues
// beyond it for a softer fade.
const MASK_FADE_INNER_RATIO = 1.0;
const MASK_FADE_OUTER_RATIO = 1.22;

const HEX_GRID_RADIUS = 5;
const HEX_CELL_FILL_ALPHA = 16;
const HEX_ACTIVE_FILL_ALPHA = 60;
const GRID_VALUE_ALPHA = 180;

// Base 3x3 square remapped into the hex grid as a horizontal diamond.
// 1 is the pivot at the center and the shape extends to the right.
const BASE_DIAMOND_CELLS = [
  { q: 0, r: 0, value: 1 },
  { q: 1, r: -1, value: 2 },
  { q: 1, r: 0, value: 3 },
  { q: 2, r: -2, value: 4 },
  { q: 2, r: -1, value: 5 },
  { q: 2, r: 0, value: 6 },
  { q: 3, r: -2, value: 7 },
  { q: 3, r: -1, value: 8 },
  { q: 4, r: -2, value: 9 }
];
const SHAPE_ROTATION_COUNT = 6;

export function drawTerritoryGrid(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);

  noFill();
  textFont("monospace");
  textAlign(CENTER, CENTER);

  drawHexGrid(centerX, centerY, radius);
}

function drawHexGrid(centerX, centerY, radius) {
  const canvasTheme = getCanvasTheme();
  const hexSize = getHexCellSize(radius);
  const hexCells = getHexGridCells(HEX_GRID_RADIUS);
  const rotatedOverlay = buildRotatedOverlay(BASE_DIAMOND_CELLS, SHAPE_ROTATION_COUNT);
  const starCellMap = new Map(
    rotatedOverlay.digitalRootCells.map((cell) => [`${cell.q},${cell.r}`, cell.value])
  );

  stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  strokeWeight(1);

  for (const cell of hexCells) {
    const { x, y } = axialToPixel(cell.q, cell.r, hexSize, centerX, centerY);
    const starValue = starCellMap.get(`${cell.q},${cell.r}`);

    if (starValue) {
      fill(...canvasTheme.textStrong, HEX_ACTIVE_FILL_ALPHA);
    } else {
      fill(...canvasTheme.accent, HEX_CELL_FILL_ALPHA);
    }

    drawHexagon(x, y, hexSize);

    if (!starValue) {
      continue;
    }

    noStroke();
    fill(...canvasTheme.textStrong, GRID_VALUE_ALPHA);
    textSize(getHexTextSize(hexSize));
    text(String(starValue), x, y + 1);
    stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  }
}

function buildRotatedOverlay(sourceCells, rotationCount) {
  const rawSumByCoordinate = new Map();

  for (let rotationIndex = 0; rotationIndex < rotationCount; rotationIndex += 1) {
    for (const cell of sourceCells) {
      const rotatedCell = rotateAxialCell(cell.q, cell.r, rotationIndex);
      addValueToCoordinateMap(
        rawSumByCoordinate,
        `${rotatedCell.q},${rotatedCell.r}`,
        cell.value
      );
    }
  }

  const rawSumCells = coordinateMapToCells(rawSumByCoordinate);

  return {
    rawSumCells,
    digitalRootCells: rawSumCells.map((cell) => ({
      q: cell.q,
      r: cell.r,
      value: reduceDigitalRoot(cell.value)
    }))
  };
}

function getHexGridCells(gridRadius) {
  const cells = [];

  for (let q = -gridRadius; q <= gridRadius; q += 1) {
    const rMin = Math.max(-gridRadius, -q - gridRadius);
    const rMax = Math.min(gridRadius, -q + gridRadius);

    for (let r = rMin; r <= rMax; r += 1) {
      cells.push({ q, r });
    }
  }

  return cells;
}

function getHexCellSize(radius) {
  return radius / (HEX_GRID_RADIUS * 2.6);
}

function getHexTextSize(hexSize) {
  return Math.max(10, hexSize * 0.82);
}

function axialToPixel(q, r, hexSize, centerX, centerY) {
  return {
    x: centerX + hexSize * 1.5 * q,
    y: centerY + hexSize * Math.sqrt(3) * (r + q / 2)
  };
}

function drawHexagon(centerX, centerY, hexSize) {
  beginShape();

  for (let corner = 0; corner < 6; corner += 1) {
    const angle = corner * (PI / 3);
    vertex(
      centerX + Math.cos(angle) * hexSize,
      centerY + Math.sin(angle) * hexSize
    );
  }

  endShape(CLOSE);
}

function rotateAxialCell(q, r, turns) {
  let rotatedQ = q;
  let rotatedR = r;

  for (let turn = 0; turn < turns; turn += 1) {
    [rotatedQ, rotatedR] = rotateAxial60Degrees(rotatedQ, rotatedR);
  }

  return {
    q: rotatedQ,
    r: rotatedR
  };
}

function rotateAxial60Degrees(q, r) {
  return [-r, q + r];
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

function reduceDigitalRoot(value) {
  if (value === 0) {
    return 0;
  }

  return ((value - 1) % 9) + 1;
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
