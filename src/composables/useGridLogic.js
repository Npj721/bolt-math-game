import { operations } from '../config/games'

export function useGridLogic(level) {
  function generateGrid() {
    return operations.grid.generateGrid(level)
  }

  function generateRevealedGrid(rows, cols) {
    const revealed = []
    const totalCells = rows * cols
    const cellsToReveal = Math.floor(totalCells * 0.2)
    
    // Initialize all cells as hidden
    for (let i = 0; i < rows; i++) {
      revealed.push(new Array(cols).fill(false))
    }
    
    // Reveal random cells
    for (let i = 0; i < cellsToReveal; i++) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)
      revealed[row][col] = true
    }
    
    return revealed
  }

  function selectTargetNumber(grid, revealed) {
    const availableNumbers = []
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (!revealed[i][j]) {
          availableNumbers.push(grid[i][j])
        }
      }
    }
    return availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
  }

  return {
    generateGrid,
    generateRevealedGrid,
    selectTargetNumber
  }
}