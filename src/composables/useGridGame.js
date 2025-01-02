import { useGridState } from './useGridState'
import { useGridLogic } from './useGridLogic'

export function useGridGame(level) {
  const { grid, revealed, targetNumber, attempts } = useGridState(level)
  const { generateGrid, generateRevealedGrid, selectTargetNumber } = useGridLogic(level)

  function initGrid() {
    grid.value = generateGrid()
    revealed.value = generateRevealedGrid(level.rows, level.cols)
    targetNumber.value = selectTargetNumber(grid.value, revealed.value)
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