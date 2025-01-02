import { ref } from 'vue'

export function useGridState(level) {
  const grid = ref([])
  const revealed = ref([])
  const targetNumber = ref(0)
  const attempts = ref(0)
  
  return {
    grid,
    revealed,
    targetNumber,
    attempts
  }
}