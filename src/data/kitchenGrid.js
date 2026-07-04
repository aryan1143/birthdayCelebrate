/**
 * TUNE THIS FILE when the real kitchen.png arrives.
 *
 * 1. Adjust GRID_COLS and GRID_ROWS to match the aspect ratio of the image.
 * 2. Adjust CELL_SIZE so the grid neatly covers the playable area.
 * 3. Update KITCHEN_GRID: 0 = Walkable, 1 = Blocked (Table/Counter).
 */

export const GRID_COLS = 10;
export const GRID_ROWS = 10;
export const CELL_SIZE = 48; // px

// 10x10 Grid. 0 = Walkable, 1 = Obstacle
export const KITCHEN_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

/** Convert pixel coordinates (relative to grid container) to grid cell {col, row} */
export function pixelToGrid(x, y) {
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);

  return {
    col: Math.max(0, Math.min(GRID_COLS - 1, col)),
    row: Math.max(0, Math.min(GRID_ROWS - 1, row)),
  };
}

/** Convert grid cell to pixel coordinates (returns center of the cell) */
export function gridToPixel(col, row) {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}
