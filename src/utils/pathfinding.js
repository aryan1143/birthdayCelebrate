import { KITCHEN_GRID, GRID_COLS, GRID_ROWS } from '../data/kitchenGrid'

// Directions: Up, Right, Down, Left
const DIRS = [
  { dc: 0, dr: -1 },
  { dc: 1, dr: 0 },
  { dc: 0, dr: 1 },
  { dc: -1, dr: 0 },
]

function isValidCell(col, row) {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS
}

function isWalkable(col, row) {
  return isValidCell(col, row) && KITCHEN_GRID[row][col] === 0
}

/**
 * Finds the nearest walkable cell to the target.
 * If target itself is walkable, returns it.
 * Uses BFS to search outward from target.
 */
function findNearestWalkable(startCol, startRow) {
  if (isWalkable(startCol, startRow)) return { col: startCol, row: startRow }

  const queue = [{ col: startCol, row: startRow }]
  const visited = new Set([`${startCol},${startRow}`])

  while (queue.length > 0) {
    const { col, row } = queue.shift()

    if (isWalkable(col, row)) {
      return { col, row }
    }

    for (const { dc, dr } of DIRS) {
      const nc = col + dc
      const nr = row + dr
      const key = `${nc},${nr}`

      if (isValidCell(nc, nr) && !visited.has(key)) {
        visited.add(key)
        queue.push({ col: nc, row: nr })
      }
    }
  }

  return null // Should only happen if the entire grid is blocked
}

/**
 * BFS Shortest Path
 * Returns an array of {col, row} representing the path from start (exclusive) to target (inclusive).
 * If target is blocked, it paths to the nearest walkable cell to that target.
 */
export function findPath(startCol, startRow, targetCol, targetRow) {
  const actualTarget = findNearestWalkable(targetCol, targetRow)
  if (!actualTarget) return [] // No walkable cells exist

  // If we're already at the target, no path needed
  if (startCol === actualTarget.col && startRow === actualTarget.row) {
    return []
  }

  const queue = [{ col: startCol, row: startRow, path: [] }]
  const visited = new Set([`${startCol},${startRow}`])

  while (queue.length > 0) {
    const { col, row, path } = queue.shift()

    if (col === actualTarget.col && row === actualTarget.row) {
      return path
    }

    for (const { dc, dr } of DIRS) {
      const nc = col + dc
      const nr = row + dr
      const key = `${nc},${nr}`

      if (isWalkable(nc, nr) && !visited.has(key)) {
        visited.add(key)
        queue.push({
          col: nc,
          row: nr,
          path: [...path, { col: nc, row: nr }],
        })
      }
    }
  }

  // No path found (isolated area)
  return []
}
