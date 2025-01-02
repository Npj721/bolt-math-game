import { ref, computed } from 'vue'

export function useGrid(level) {
  const grid = ref([])
  const revealed = ref([])
  const targetNumber = ref(0)
  const attempts = ref(0)

  function initGrid() {
    const { rows, cols, startNumber, pctReveal } = level
    const totalCells = rows * cols
    grid.value = []
    revealed.value = []
    
    // Create grid with incremental numbers
    for (let i = 0; i < rows; i++) {
      const row = []
      const revealedRow = []
      for (let j = 0; j < cols; j++) {
        row.push(startNumber + (i * cols) + j)
        revealedRow.push(false)
      }
      grid.value.push(row)
      revealed.value.push(revealedRow)
    }

    // Reveal random cells 
    const cellsToReveal = Math.floor(totalCells * pctReveal)
    for (let i = 0; i < cellsToReveal; i++) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)
      revealed.value[row][col] = true
    }

    // Choose a target number from hidden cells
    const availableNumbers = []
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!revealed.value[i][j]) {
          availableNumbers.push(grid.value[i][j])
        }
      }
    }
    targetNumber.value = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
    attempts.value = 0
  }

  return {
    grid,
    revealed,
    targetNumber,
    attempts,
    initGrid
  }
}