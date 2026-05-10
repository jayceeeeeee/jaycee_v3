import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

const HEX_GRID_RADIUS = 16;
const GRID_STROKE_ALPHA = 80;
const GRID_FILL_ALPHA = 14;
const ACTIVE_FILL_ALPHA = 58;
const PREVIEW_FILL_ALPHA = 26;
const ACTIVE_TEXT_ALPHA = 210;
const GUIDE_TEXT_ALPHA = 160;
const HEX_EDITOR_RADIUS_SCALE = 1.58;

const DIAMOND_NINE_SHAPE = {
  id: "diamond-nine",
  name: "Losange 9",
  anchor: { q: 0, r: 0 },
  // Shape centered on 5 and extending horizontally.
  cells: [
    { q: -2, r: 1, value: 1 },
    { q: -1, r: 0, value: 2 },
    { q: -1, r: 1, value: 3 },
    { q: 0, r: -1, value: 4 },
    { q: 0, r: 0, value: 5 },
    { q: 0, r: 1, value: 6 },
    { q: 1, r: -1, value: 7 },
    { q: 1, r: 0, value: 8 },
    { q: 2, r: -1, value: 9 }
  ]
};

const SIX_DIAMOND_STAR_SHAPE = buildRotatedDigitalRootShape(
  "six-diamond-star",
  "Etoile 6x",
  DIAMOND_NINE_SHAPE.cells,
  { q: -2, r: 1 }
);

const BIG_DIAMOND_FIVE_SHAPE = buildDiamondRowsShape(
  "big-diamond-5",
  "Grand losange 5x5",
  [
    [4],
    [6, 2],
    [7, 5, 2],
    [3, 2, 1, 7],
    [1, 1, 4, 2, 9],
    [4, 4, 3, 8],
    [1, 7, 5],
    [9, 5],
    [6]
  ]
);

const BIG_DIAMOND_FIVE_NINE_OVERLAY_SHAPE = buildOverlayShapeFromAnchors(
  "big-diamond-5-center",
  "Grand losange 5x5 + centre",
  DIAMOND_NINE_SHAPE.cells,
  DIAMOND_NINE_SHAPE.cells.map((cell) => ({ q: cell.q, r: cell.r }))
);

const BIG_DIAMOND_SEVEN_SHAPE = buildDiamondRowsShape(
  "big-diamond-7",
  "Grand losange 7x7",
  [
    [4],
    [1, 6],
    [8, 3, 8],
    [7, 5, 4, 2],
    [2, 4, 6, 3, 9],
    [4, 3, 1, 9, 9, 7],
    [1, 1, 2, 2, 7, 8, 9],
    [5, 9, 6, 5, 6, 8],
    [6, 9, 3, 8, 4],
    [5, 5, 4, 9],
    [7, 6, 7],
    [6, 2],
    [6]
  ]
);

const SHAPE_LIBRARY = [
  DIAMOND_NINE_SHAPE,
  SIX_DIAMOND_STAR_SHAPE,
  BIG_DIAMOND_FIVE_SHAPE,
  BIG_DIAMOND_FIVE_NINE_OVERLAY_SHAPE,
  BIG_DIAMOND_SEVEN_SHAPE
];

const editorState = {
  selectedShapeId: SHAPE_LIBRARY[0].id,
  selectedRotation: 0,
  placedShapes: [],
  contextMenuDisabled: false
};

export function initializeHexShapeEditor() {
  ensureEditorControls();

  if (!editorState.contextMenuDisabled) {
    window.addEventListener("contextmenu", preventContextMenu);
    editorState.contextMenuDisabled = true;
  }
}

export function drawHexShapeEditor(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const canvasTheme = getCanvasTheme();
  const editorRadius = getEditorRadius(radius);
  const hexSize = getHexCellSize(editorRadius);
  const hexCells = getHexGridCells(HEX_GRID_RADIUS);
  const overlay = buildPlacedShapesOverlay();
  const overlayMap = new Map(
    overlay.digitalRootCells.map((cell) => [getCellKey(cell.q, cell.r), cell.value])
  );
  const hoveredCell = getHoveredHexCell(editorRadius);
  const previewCells = hoveredCell ? buildPreviewCells(hoveredCell.q, hoveredCell.r) : [];
  const previewMap = new Map(previewCells.map((cell) => [getCellKey(cell.q, cell.r), cell.value]));

  textFont("monospace");
  textAlign(CENTER, CENTER);
  stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  strokeWeight(1);

  for (const cell of hexCells) {
    const { x, y } = axialToPixel(cell.q, cell.r, hexSize, centerX, centerY);
    const cellKey = getCellKey(cell.q, cell.r);
    const overlayValue = overlayMap.get(cellKey);
    const previewValue = previewMap.get(cellKey);

    if (overlayValue) {
      fill(...canvasTheme.textStrong, ACTIVE_FILL_ALPHA);
    } else if (previewValue) {
      fill(...canvasTheme.textStrong, PREVIEW_FILL_ALPHA);
    } else {
      fill(...canvasTheme.accent, GRID_FILL_ALPHA);
    }

    drawHexagon(x, y, hexSize);

    if (!overlayValue && !previewValue) {
      continue;
    }

    noStroke();
    fill(...canvasTheme.textStrong, ACTIVE_TEXT_ALPHA);
    textSize(getHexTextSize(hexSize));
    text(String(overlayValue ?? previewValue), x, y + 1);
    stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  }

  drawEditorHud(canvasTheme);
}

export function placeSelectedHexShapeAtPointer() {
  const hoveredCell = getHoveredHexCell(getEditorRadiusFromViewport());

  if (!hoveredCell) {
    return;
  }

  editorState.placedShapes.push({
    shapeId: editorState.selectedShapeId,
    rotation: editorState.selectedRotation,
    anchorQ: hoveredCell.q,
    anchorR: hoveredCell.r
  });

  syncEditorStatus();
}

function ensureEditorControls() {
  const infoPanel = document.getElementById("info-panel");

  if (!infoPanel || document.getElementById("hex-editor-section")) {
    syncEditorStatus();
    return;
  }

  const section = document.createElement("section");
  section.id = "hex-editor-section";
  section.className = "panel-section";
  section.setAttribute("aria-labelledby", "hex-editor-title");

  section.innerHTML = `
    <h2 id="hex-editor-title">Hex Editor</h2>
    <div class="control-group">
      <span class="control-label">Shapes</span>
      <div id="hex-shape-list" class="hex-editor-option-list"></div>
    </div>
    <div class="control-group">
      <span class="control-label">Rotation</span>
      <div id="hex-rotation-list" class="hex-editor-option-list"></div>
    </div>
    <div class="control-actions">
      <button id="hex-editor-undo" class="control-button control-button-secondary" type="button">Undo</button>
      <button id="hex-editor-clear" class="control-button control-button-secondary" type="button">Clear</button>
    </div>
    <p id="hex-editor-status" class="control-status" data-tone="muted"></p>
  `;

  infoPanel.append(section);

  renderShapeButtons();
  renderRotationButtons();
  wireEditorButtons();
  syncEditorStatus();
}

function renderShapeButtons() {
  const shapeList = document.getElementById("hex-shape-list");

  if (!shapeList) {
    return;
  }

  shapeList.innerHTML = SHAPE_LIBRARY.map((shape) => {
    const isSelected = shape.id === editorState.selectedShapeId;

    return `
      <button
        class="control-button ${isSelected ? "" : "control-button-secondary"} hex-editor-option"
        type="button"
        data-shape-id="${shape.id}"
        aria-pressed="${isSelected}"
      >
        ${shape.name}
      </button>
    `;
  }).join("");

  for (const button of shapeList.querySelectorAll("[data-shape-id]")) {
    button.addEventListener("click", () => {
      editorState.selectedShapeId = button.dataset.shapeId;
      renderShapeButtons();
      syncEditorStatus();
    });
  }
}

function renderRotationButtons() {
  const rotationList = document.getElementById("hex-rotation-list");

  if (!rotationList) {
    return;
  }

  rotationList.innerHTML = Array.from({ length: 6 }, (_, index) => {
    const isSelected = index === editorState.selectedRotation;

    return `
      <button
        class="control-button ${isSelected ? "" : "control-button-secondary"} hex-editor-option"
        type="button"
        data-rotation-index="${index}"
        aria-pressed="${isSelected}"
      >
        ${index * 60}°
      </button>
    `;
  }).join("");

  for (const button of rotationList.querySelectorAll("[data-rotation-index]")) {
    button.addEventListener("click", () => {
      editorState.selectedRotation = Number(button.dataset.rotationIndex);
      renderRotationButtons();
      syncEditorStatus();
    });
  }
}

function wireEditorButtons() {
  document.getElementById("hex-editor-undo")?.addEventListener("click", () => {
    editorState.placedShapes.pop();
    syncEditorStatus();
  });

  document.getElementById("hex-editor-clear")?.addEventListener("click", () => {
    editorState.placedShapes = [];
    syncEditorStatus();
  });
}

function buildPlacedShapesOverlay() {
  const rawSumByCoordinate = new Map();

  for (const placedShape of editorState.placedShapes) {
    const resolvedCells = resolvePlacedShapeCells(placedShape);

    for (const cell of resolvedCells) {
      addValueToCoordinateMap(rawSumByCoordinate, getCellKey(cell.q, cell.r), cell.value);
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

function buildRotatedDigitalRootShape(id, name, sourceCells, pivot) {
  const rawSumByCoordinate = new Map();

  for (let rotationIndex = 0; rotationIndex < 6; rotationIndex += 1) {
    for (const cell of sourceCells) {
      const translatedQ = cell.q - pivot.q;
      const translatedR = cell.r - pivot.r;
      const rotatedCell = rotateAxialCell(translatedQ, translatedR, rotationIndex);

      addValueToCoordinateMap(
        rawSumByCoordinate,
        getCellKey(rotatedCell.q, rotatedCell.r),
        cell.value
      );
    }
  }

  const cells = coordinateMapToCells(rawSumByCoordinate).map((cell) => ({
    q: cell.q,
    r: cell.r,
    value: reduceDigitalRoot(cell.value)
  }));

  return {
    id,
    name,
    anchor: { q: 0, r: 0 },
    cells
  };
}

function buildDiamondRowsShape(id, name, rows) {
  const cells = [];
  const middleRowIndex = Math.floor(rows.length / 2);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const rowValues = rows[rowIndex];
    const distanceFromMiddle = rowIndex - middleRowIndex;
    const qStart = -rowValues.length + 1;
    const projectedY = distanceFromMiddle / 2;

    for (let columnIndex = 0; columnIndex < rowValues.length; columnIndex += 1) {
      const q = qStart + columnIndex * 2;
      const r = projectedY - q / 2;

      cells.push({
        q,
        r,
        value: rowValues[columnIndex]
      });
    }
  }

  return {
    id,
    name,
    anchor: { q: 0, r: 0 },
    cells
  };
}

function buildOverlayShapeFromAnchors(id, name, sourceCells, anchors) {
  const rawSumByCoordinate = new Map();

  for (const anchor of anchors) {
    for (const cell of sourceCells) {
      const centeredQ = cell.q - DIAMOND_NINE_SHAPE.anchor.q;
      const centeredR = cell.r - DIAMOND_NINE_SHAPE.anchor.r;

      addValueToCoordinateMap(
        rawSumByCoordinate,
        getCellKey(centeredQ + anchor.q, centeredR + anchor.r),
        cell.value
      );
    }
  }

  const cells = coordinateMapToCells(rawSumByCoordinate).map((cell) => ({
    q: cell.q,
    r: cell.r,
    value: reduceDigitalRoot(cell.value)
  }));

  return {
    id,
    name,
    anchor: { q: 0, r: 0 },
    cells
  };
}

function buildPreviewCells(anchorQ, anchorR) {
  return resolvePlacedShapeCells({
    shapeId: editorState.selectedShapeId,
    rotation: editorState.selectedRotation,
    anchorQ,
    anchorR
  });
}

function resolvePlacedShapeCells(placedShape) {
  const shape = SHAPE_LIBRARY.find((entry) => entry.id === placedShape.shapeId);

  if (!shape) {
    return [];
  }

  return shape.cells.map((cell) => {
    const centeredQ = cell.q - shape.anchor.q;
    const centeredR = cell.r - shape.anchor.r;
    const rotatedCell = rotateAxialCell(centeredQ, centeredR, placedShape.rotation);

    return {
      q: rotatedCell.q + placedShape.anchorQ,
      r: rotatedCell.r + placedShape.anchorR,
      value: cell.value
    };
  });
}

function getHoveredHexCell(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const hexSize = getHexCellSize(radius);
  let closestCell = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const cell of getHexGridCells(HEX_GRID_RADIUS)) {
    const pixelPosition = axialToPixel(cell.q, cell.r, hexSize, centerX, centerY);
    const distance = dist(mouseX, mouseY, pixelPosition.x, pixelPosition.y);

    if (distance > hexSize || distance >= closestDistance) {
      continue;
    }

    closestCell = cell;
    closestDistance = distance;
  }

  return closestCell;
}

function getEditorRadius(radius) {
  return radius * HEX_EDITOR_RADIUS_SCALE;
}

function getEditorRadiusFromViewport() {
  const viewportRadius = Math.min(width, height) * 0.25;
  return getEditorRadius(viewportRadius);
}

function drawEditorHud(canvasTheme) {
  const selectedShape = SHAPE_LIBRARY.find((shape) => shape.id === editorState.selectedShapeId);
  const hudLines = [
    `Click: place shape`,
    `${selectedShape?.name ?? "Shape"} at ${editorState.selectedRotation * 60}°`,
    `${editorState.placedShapes.length} placed`
  ];

  push();
  noStroke();
  fill(...canvasTheme.textStrong, GUIDE_TEXT_ALPHA);
  textAlign(LEFT, TOP);
  textSize(13);

  let currentY = 24;

  for (const line of hudLines) {
    text(line, 24, currentY);
    currentY += 18;
  }

  pop();
}

function syncEditorStatus() {
  const status = document.getElementById("hex-editor-status");
  const selectedShape = SHAPE_LIBRARY.find((shape) => shape.id === editorState.selectedShapeId);

  if (!status) {
    return;
  }

  status.dataset.tone = "muted";
  status.textContent =
    `${selectedShape?.name ?? "Shape"} · rotation ${editorState.selectedRotation * 60}° · ${editorState.placedShapes.length} formes`;
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
  return radius / (HEX_GRID_RADIUS * 1.72);
}

function getHexTextSize(hexSize) {
  return Math.max(11, hexSize * 0.82);
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

function getCellKey(q, r) {
  return `${q},${r}`;
}

function preventContextMenu(event) {
  event.preventDefault();
}
