import { getSketchLayoutMetrics } from "../layout/sketchLayout.js";
import { getCanvasTheme } from "../state/theme.js";

const SQUARE_GRID_RADIUS = 16;
const GRID_STROKE_ALPHA = 80;
const GRID_FILL_ALPHA = 14;
const ACTIVE_FILL_ALPHA = 58;
const PREVIEW_FILL_ALPHA = 26;
const ACTIVE_TEXT_ALPHA = 210;
const GUIDE_TEXT_ALPHA = 160;
const SQUARE_EDITOR_RADIUS_SCALE = 1.58;
const ROTATION_STEP_DEGREES = 90;
const ROTATION_COUNT = 4;
const SHAPE_LAYOUTS = [
  { id: "diamond", label: "Losange" },
  { id: "square", label: "Carre" },
  { id: "square-spaced", label: "Carre 9x9" }
];

const STRAIGHT_NINE_CELLS = [
  { x: -1, y: -1, value: 1 },
  { x: 0, y: -1, value: 2 },
  { x: 1, y: -1, value: 4 },
  { x: -1, y: 0, value: 3 },
  { x: 0, y: 0, value: 5 },
  { x: 1, y: 0, value: 7 },
  { x: -1, y: 1, value: 6 },
  { x: 0, y: 1, value: 8 },
  { x: 1, y: 1, value: 9 }
];

const SQUARE_123_456_789_CELLS = buildSquareCellsFromRows([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]);

const SQUARE_124_357_689_CELLS = buildSquareCellsFromRows([
  [1, 2, 4],
  [3, 5, 7],
  [6, 8, 9]
]);

const SQUARE_461_597_238_CELLS = buildSquareCellsFromRows([
  [4, 6, 1],
  [5, 9, 7],
  [2, 3, 8]
]);

const SQUARE_465_197_238_CELLS = buildSquareCellsFromRows([
  [4, 6, 5],
  [1, 9, 7],
  [2, 3, 8]
]);

const SQUARE_461_592_738_CELLS = buildSquareCellsFromRows([
  [4, 6, 1],
  [5, 9, 2],
  [7, 3, 8]
]);

const SQUARE_465_192_738_CELLS = buildSquareCellsFromRows([
  [4, 6, 5],
  [1, 9, 2],
  [7, 3, 8]
]);

const DIAMOND_NINE_SHAPE = {
  id: "diamond-nine",
  name: "Losange 9",
  anchor: { x: 0, y: 0 },
  cells: [
    { x: 0, y: -2, value: 4 },
    { x: -1, y: -1, value: 2 },
    { x: 1, y: -1, value: 7 },
    { x: -2, y: 0, value: 1 },
    { x: 0, y: 0, value: 5 },
    { x: 2, y: 0, value: 9 },
    { x: -1, y: 1, value: 3 },
    { x: 1, y: 1, value: 8 },
    { x: 0, y: 2, value: 6 }
  ],
  squareCells: STRAIGHT_NINE_CELLS,
  spacedSquareCells: addOneEmptyCellBetweenSquareCells(STRAIGHT_NINE_CELLS)
};

const SQUARE_461_597_238_SHAPE = buildShapeFromSquareCells(
  "square-461-597-238",
  "Carre 461 BJS",
  SQUARE_461_597_238_CELLS
);

const SQUARE_123_456_789_SHAPE = buildShapeFromSquareCells(
  "square-123-456-789",
  "Carre 123",
  SQUARE_123_456_789_CELLS
);

const SQUARE_124_357_689_SHAPE = buildShapeFromSquareCells(
  "square-124-357-689",
  "Carre 124",
  SQUARE_124_357_689_CELLS
);

const SQUARE_465_197_238_SHAPE = buildShapeFromSquareCells(
  "square-465-197-238",
  "Carre 465",
  SQUARE_465_197_238_CELLS
);

const SQUARE_461_592_738_SHAPE = buildShapeFromSquareCells(
  "square-461-592-738",
  "Carre 461",
  SQUARE_461_592_738_CELLS
);

const SQUARE_465_192_738_SHAPE = buildShapeFromSquareCells(
  "square-465-192-738",
  "Carre 465 LS",
  SQUARE_465_192_738_CELLS
);

const FOUR_DIAMOND_STAR_SHAPE = buildRotatedDigitalRootShape(
  "four-diamond-star",
  "Etoile 4x",
  DIAMOND_NINE_SHAPE.cells,
  { x: -2, y: 0 }
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
  DIAMOND_NINE_SHAPE.cells.map((cell) => ({ x: cell.x, y: cell.y }))
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
  SQUARE_123_456_789_SHAPE,
  SQUARE_124_357_689_SHAPE,
  SQUARE_461_597_238_SHAPE,
  SQUARE_465_197_238_SHAPE,
  SQUARE_461_592_738_SHAPE,
  SQUARE_465_192_738_SHAPE,
  FOUR_DIAMOND_STAR_SHAPE,
  BIG_DIAMOND_FIVE_SHAPE,
  BIG_DIAMOND_FIVE_NINE_OVERLAY_SHAPE,
  BIG_DIAMOND_SEVEN_SHAPE
];

const editorState = {
  selectedShapeId: SHAPE_LIBRARY[0].id,
  selectedLayout: "square",
  selectedRotation: 0,
  invertX: false,
  invertY: false,
  invertDiagonal: false,
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
  const cellSize = getSquareCellSize(editorRadius);
  const squareCells = getSquareGridCells(SQUARE_GRID_RADIUS);
  const overlay = buildPlacedShapesOverlay();
  const overlayMap = new Map(
    overlay.digitalRootCells.map((cell) => [getCellKey(cell.x, cell.y), cell.value])
  );
  const hoveredCell = getHoveredSquareCell(editorRadius);
  const previewCells = hoveredCell ? buildPreviewCells(hoveredCell.x, hoveredCell.y) : [];
  const previewMap = new Map(previewCells.map((cell) => [getCellKey(cell.x, cell.y), cell.value]));

  push();
  textFont("monospace");
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  strokeWeight(1);

  for (const cell of squareCells) {
    const { x, y } = squareToPixel(cell.x, cell.y, cellSize, centerX, centerY);
    const cellKey = getCellKey(cell.x, cell.y);
    const overlayValue = overlayMap.get(cellKey);
    const previewValue = previewMap.get(cellKey);

    if (overlayValue) {
      fill(...canvasTheme.textStrong, ACTIVE_FILL_ALPHA);
    } else if (previewValue) {
      fill(...canvasTheme.textStrong, PREVIEW_FILL_ALPHA);
    } else {
      fill(...canvasTheme.accent, GRID_FILL_ALPHA);
    }

    drawSquareCell(x, y, cellSize);

    if (!overlayValue && !previewValue) {
      continue;
    }

    noStroke();
    fill(...canvasTheme.textStrong, ACTIVE_TEXT_ALPHA);
    textSize(getSquareTextSize(cellSize));
    text(String(overlayValue ?? previewValue), x, y + 1);
    stroke(...canvasTheme.accent, GRID_STROKE_ALPHA);
  }

  pop();

  drawEditorHud(canvasTheme);
}

export function placeSelectedHexShapeAtPointer() {
  const hoveredCell = getHoveredSquareCell(getEditorRadiusFromViewport());

  if (!hoveredCell) {
    return;
  }

  editorState.placedShapes.push({
    shapeId: editorState.selectedShapeId,
    layout: editorState.selectedLayout,
    rotation: editorState.selectedRotation,
    invertX: editorState.invertX,
    invertY: editorState.invertY,
    invertDiagonal: editorState.invertDiagonal,
    anchorX: hoveredCell.x,
    anchorY: hoveredCell.y
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
    <h2 id="hex-editor-title">Square Editor</h2>
    <div class="control-group">
      <span class="control-label">Shapes</span>
      <div id="hex-shape-list" class="hex-editor-option-list"></div>
    </div>
    <div class="control-group">
      <span class="control-label">Rotation</span>
      <div id="hex-rotation-list" class="hex-editor-option-list"></div>
    </div>
    <div class="control-group">
      <span class="control-label">Layout</span>
      <div id="hex-layout-list" class="hex-editor-option-list"></div>
    </div>
    <div class="control-group">
      <span class="control-label">Invert</span>
      <div class="hex-editor-option-list">
        <label class="hex-editor-toggle">
          <input id="hex-editor-invert-x" type="checkbox" />
          <span>X</span>
        </label>
        <label class="hex-editor-toggle">
          <input id="hex-editor-invert-y" type="checkbox" />
          <span>Y</span>
        </label>
        <label class="hex-editor-toggle">
          <input id="hex-editor-invert-diagonal" type="checkbox" />
          <span>Diagonal</span>
        </label>
      </div>
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
  renderLayoutButtons();
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

function renderLayoutButtons() {
  const layoutList = document.getElementById("hex-layout-list");

  if (!layoutList) {
    return;
  }

  layoutList.innerHTML = SHAPE_LAYOUTS.map((layout) => {
    const isSelected = layout.id === editorState.selectedLayout;

    return `
      <button
        class="control-button ${isSelected ? "" : "control-button-secondary"} hex-editor-option"
        type="button"
        data-layout-id="${layout.id}"
        aria-pressed="${isSelected}"
      >
        ${layout.label}
      </button>
    `;
  }).join("");

  for (const button of layoutList.querySelectorAll("[data-layout-id]")) {
    button.addEventListener("click", () => {
      editorState.selectedLayout = button.dataset.layoutId;
      renderLayoutButtons();
      syncEditorStatus();
    });
  }
}

function renderRotationButtons() {
  const rotationList = document.getElementById("hex-rotation-list");

  if (!rotationList) {
    return;
  }

  rotationList.innerHTML = Array.from({ length: ROTATION_COUNT }, (_, index) => {
    const isSelected = index === editorState.selectedRotation;

    return `
      <button
        class="control-button ${isSelected ? "" : "control-button-secondary"} hex-editor-option"
        type="button"
        data-rotation-index="${index}"
        aria-pressed="${isSelected}"
      >
        ${index * ROTATION_STEP_DEGREES}deg
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
  document.getElementById("hex-editor-invert-x")?.addEventListener("change", (event) => {
    editorState.invertX = event.target.checked;
    syncEditorStatus();
  });

  document.getElementById("hex-editor-invert-y")?.addEventListener("change", (event) => {
    editorState.invertY = event.target.checked;
    syncEditorStatus();
  });

  document.getElementById("hex-editor-invert-diagonal")?.addEventListener("change", (event) => {
    editorState.invertDiagonal = event.target.checked;
    syncEditorStatus();
  });

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
      addValueToCoordinateMap(rawSumByCoordinate, getCellKey(cell.x, cell.y), cell.value);
    }
  }

  const rawSumCells = coordinateMapToCells(rawSumByCoordinate);

  return {
    rawSumCells,
    digitalRootCells: rawSumCells.map((cell) => ({
      x: cell.x,
      y: cell.y,
      value: reduceDigitalRoot(cell.value)
    }))
  };
}

function buildRotatedDigitalRootShape(id, name, diamondSourceCells, pivot) {
  const cells = buildRotatedDigitalRootCells(diamondSourceCells, pivot);
  const squareCells = normalizeShapeCells(diamondToSquareCells(cells));
  const spacedSquareCells = addOneEmptyCellBetweenSquareCells(squareCells);

  return {
    id,
    name,
    anchor: { x: 0, y: 0 },
    cells,
    squareCells,
    spacedSquareCells
  };
}

function buildShapeFromSquareCells(id, name, squareCells) {
  return {
    id,
    name,
    anchor: { x: 0, y: 0 },
    cells: squareToDiamondCells(squareCells),
    squareCells,
    spacedSquareCells: addOneEmptyCellBetweenSquareCells(squareCells)
  };
}

function buildRotatedDigitalRootCells(sourceCells, pivot) {
  const rawSumByCoordinate = new Map();

  for (let rotationIndex = 0; rotationIndex < ROTATION_COUNT; rotationIndex += 1) {
    for (const cell of sourceCells) {
      const translatedX = cell.x - pivot.x;
      const translatedY = cell.y - pivot.y;
      const rotatedCell = rotateSquareCell(translatedX, translatedY, rotationIndex);

      addValueToCoordinateMap(
        rawSumByCoordinate,
        getCellKey(rotatedCell.x, rotatedCell.y),
        cell.value
      );
    }
  }

  return coordinateMapToCells(rawSumByCoordinate).map((cell) => ({
    x: cell.x,
    y: cell.y,
    value: reduceDigitalRoot(cell.value)
  }));
}

function buildSquareCellsFromRows(rows) {
  const middleRowIndex = Math.floor(rows.length / 2);

  return rows.flatMap((rowValues, rowIndex) => {
    const middleColumnIndex = Math.floor(rowValues.length / 2);

    return rowValues.map((value, columnIndex) => ({
      x: columnIndex - middleColumnIndex,
      y: rowIndex - middleRowIndex,
      value
    }));
  });
}

function buildDiamondRowsShape(id, name, rows) {
  const cells = [];
  const middleRowIndex = Math.floor(rows.length / 2);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const rowValues = rows[rowIndex];
    const y = rowIndex - middleRowIndex;
    const xStart = -rowValues.length + 1;

    for (let columnIndex = 0; columnIndex < rowValues.length; columnIndex += 1) {
      cells.push({
        x: xStart + columnIndex * 2,
        y,
        value: rowValues[columnIndex]
      });
    }
  }

  const squareCells = normalizeShapeCells(diamondToSquareCells(cells));

  return {
    id,
    name,
    anchor: { x: 0, y: 0 },
    cells,
    squareCells,
    spacedSquareCells: addOneEmptyCellBetweenSquareCells(squareCells)
  };
}

function buildOverlayShapeFromAnchors(id, name, diamondSourceCells, diamondAnchors) {
  const cells = buildOverlayCellsFromAnchors(diamondSourceCells, diamondAnchors);
  const squareCells = normalizeShapeCells(diamondToSquareCells(cells));
  const spacedSquareCells = addOneEmptyCellBetweenSquareCells(squareCells);

  return {
    id,
    name,
    anchor: { x: 0, y: 0 },
    cells,
    squareCells,
    spacedSquareCells
  };
}

function buildOverlayCellsFromAnchors(sourceCells, anchors) {
  const rawSumByCoordinate = new Map();

  for (const anchor of anchors) {
    for (const cell of sourceCells) {
      addValueToCoordinateMap(
        rawSumByCoordinate,
        getCellKey(cell.x + anchor.x, cell.y + anchor.y),
        cell.value
      );
    }
  }

  return coordinateMapToCells(rawSumByCoordinate).map((cell) => ({
    x: cell.x,
    y: cell.y,
    value: reduceDigitalRoot(cell.value)
  }));
}

function diamondToSquareCells(cells) {
  return cells.map((cell) => ({
    x: (cell.x - cell.y) / 2,
    y: (cell.x + cell.y) / 2,
    value: cell.value
  }));
}

function squareToDiamondCells(cells) {
  return cells.map((cell) => ({
    x: cell.x + cell.y,
    y: cell.y - cell.x,
    value: cell.value
  }));
}

function normalizeShapeCells(cells) {
  const minX = Math.min(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  const maxX = Math.max(...cells.map((cell) => cell.x));
  const maxY = Math.max(...cells.map((cell) => cell.y));
  const offsetX = Math.round((minX + maxX) / 2);
  const offsetY = Math.round((minY + maxY) / 2);

  return cells.map((cell) => ({
    x: cell.x - offsetX,
    y: cell.y - offsetY,
    value: cell.value
  }));
}

function addOneEmptyCellBetweenSquareCells(cells) {
  const xMap = buildOneGapAxisMap(cells.map((cell) => cell.x));
  const yMap = buildOneGapAxisMap(cells.map((cell) => cell.y));

  return cells.map((cell) => ({
    x: xMap.get(cell.x),
    y: yMap.get(cell.y),
    value: cell.value
  }));
}

function buildOneGapAxisMap(values) {
  const uniqueValues = Array.from(new Set(values)).sort((left, right) => left - right);

  if (uniqueValues.length === 1) {
    return new Map([[uniqueValues[0], 0]]);
  }

  return new Map(uniqueValues.map((value, index) => [
    value,
    (index * 2) - (uniqueValues.length - 1)
  ]));
}

function buildPreviewCells(anchorX, anchorY) {
  return resolvePlacedShapeCells({
    shapeId: editorState.selectedShapeId,
    layout: editorState.selectedLayout,
    rotation: editorState.selectedRotation,
    invertX: editorState.invertX,
    invertY: editorState.invertY,
    invertDiagonal: editorState.invertDiagonal,
    anchorX,
    anchorY
  });
}

function resolvePlacedShapeCells(placedShape) {
  const shape = SHAPE_LIBRARY.find((entry) => entry.id === placedShape.shapeId);

  if (!shape) {
    return [];
  }

  const shapeCells = getShapeCellsForLayout(shape, placedShape.layout);

  return shapeCells.map((cell) => {
    const centeredX = cell.x - shape.anchor.x;
    const centeredY = cell.y - shape.anchor.y;
    const diagonallyMirroredCell = placedShape.invertDiagonal
      ? { x: centeredY, y: centeredX }
      : { x: centeredX, y: centeredY };
    const flippedCell = {
      x: placedShape.invertX ? -diagonallyMirroredCell.x : diagonallyMirroredCell.x,
      y: placedShape.invertY ? -diagonallyMirroredCell.y : diagonallyMirroredCell.y
    };
    const rotatedCell = rotateSquareCell(flippedCell.x, flippedCell.y, placedShape.rotation);

    return {
      x: rotatedCell.x + placedShape.anchorX,
      y: rotatedCell.y + placedShape.anchorY,
      value: cell.value
    };
  });
}

function getShapeCellsForLayout(shape, layout) {
  if (layout === "square-spaced" && shape.spacedSquareCells) {
    return shape.spacedSquareCells;
  }

  if (layout === "square" && shape.squareCells) {
    return shape.squareCells;
  }

  return shape.cells;
}

function getHoveredSquareCell(radius) {
  const { centerX, centerY } = getSketchLayoutMetrics(width, height);
  const cellSize = getSquareCellSize(radius);
  const gridWidth = (SQUARE_GRID_RADIUS * 2 + 1) * cellSize;
  const left = centerX - gridWidth / 2;
  const top = centerY - gridWidth / 2;
  const column = Math.floor((mouseX - left) / cellSize);
  const row = Math.floor((mouseY - top) / cellSize);

  if (
    column < 0 ||
    row < 0 ||
    column > SQUARE_GRID_RADIUS * 2 ||
    row > SQUARE_GRID_RADIUS * 2
  ) {
    return null;
  }

  return {
    x: column - SQUARE_GRID_RADIUS,
    y: row - SQUARE_GRID_RADIUS
  };
}

function getEditorRadius(radius) {
  return radius * SQUARE_EDITOR_RADIUS_SCALE;
}

function getEditorRadiusFromViewport() {
  const viewportRadius = Math.min(width, height) * 0.25;
  return getEditorRadius(viewportRadius);
}

function drawEditorHud(canvasTheme) {
  const selectedShape = SHAPE_LIBRARY.find((shape) => shape.id === editorState.selectedShapeId);
  const selectedLayout = SHAPE_LAYOUTS.find((layout) => layout.id === editorState.selectedLayout);
  const hudLines = [
    "Click: place shape",
    `${selectedShape?.name ?? "Shape"} at ${editorState.selectedRotation * ROTATION_STEP_DEGREES}deg`,
    `${selectedLayout?.label ?? "Layout"} invert X:${formatToggleState(editorState.invertX)} Y:${formatToggleState(editorState.invertY)} D:${formatToggleState(editorState.invertDiagonal)}`,
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
  const selectedLayout = SHAPE_LAYOUTS.find((layout) => layout.id === editorState.selectedLayout);

  if (!status) {
    return;
  }

  status.dataset.tone = "muted";
  status.textContent =
    `${selectedShape?.name ?? "Shape"} - ${selectedLayout?.label ?? "Layout"} - rotation ${editorState.selectedRotation * ROTATION_STEP_DEGREES}deg - invert X:${formatToggleState(editorState.invertX)} Y:${formatToggleState(editorState.invertY)} D:${formatToggleState(editorState.invertDiagonal)} - ${editorState.placedShapes.length} formes`;
}

function getSquareGridCells(gridRadius) {
  const cells = [];

  for (let y = -gridRadius; y <= gridRadius; y += 1) {
    for (let x = -gridRadius; x <= gridRadius; x += 1) {
      cells.push({ x, y });
    }
  }

  return cells;
}

function getSquareCellSize(radius) {
  return (radius * 2) / (SQUARE_GRID_RADIUS * 2 + 1);
}

function getSquareTextSize(cellSize) {
  return Math.max(11, cellSize * 0.48);
}

function squareToPixel(cellX, cellY, cellSize, centerX, centerY) {
  return {
    x: centerX + cellX * cellSize,
    y: centerY + cellY * cellSize
  };
}

function drawSquareCell(centerX, centerY, cellSize) {
  rect(centerX, centerY, cellSize, cellSize);
}

function rotateSquareCell(x, y, turns) {
  let rotatedX = x;
  let rotatedY = y;

  for (let turn = 0; turn < turns; turn += 1) {
    [rotatedX, rotatedY] = [-rotatedY, rotatedX];
  }

  return {
    x: rotatedX,
    y: rotatedY
  };
}

function addValueToCoordinateMap(coordinateMap, coordinateKey, value) {
  const currentValue = coordinateMap.get(coordinateKey) ?? 0;
  coordinateMap.set(coordinateKey, currentValue + value);
}

function coordinateMapToCells(coordinateMap) {
  return Array.from(coordinateMap.entries())
    .map(([key, value]) => {
      const [x, y] = key.split(",").map(Number);

      return { x, y, value };
    })
    .sort((leftCell, rightCell) => {
      if (leftCell.y !== rightCell.y) {
        return leftCell.y - rightCell.y;
      }

      return leftCell.x - rightCell.x;
    });
}

function reduceDigitalRoot(value) {
  if (value === 0) {
    return 0;
  }

  return ((value - 1) % 9) + 1;
}

function formatToggleState(isEnabled) {
  return isEnabled ? "on" : "off";
}

function getCellKey(x, y) {
  return `${x},${y}`;
}

function preventContextMenu(event) {
  event.preventDefault();
}
