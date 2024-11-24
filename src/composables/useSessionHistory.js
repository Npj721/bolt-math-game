import { ref } from 'vue'

export function useSessionHistory() {
  const history = ref(new Set())
  
  function generateKey(problem) {
    if (typeof problem === 'number') {
      return `n${problem}`
    }
    return `${problem.num1}${problem.operationType}${problem.num2}`
  }
  
  function addToHistory(problem) {
    history.value.add(generateKey(problem))
  }
  
  function isInHistory(problem) {
    return history.value.has(generateKey(problem))
  }
  
  function clearHistory() {
    history.value.clear()
  }
  
  function getHistorySize() {
    return history.value.size
  }
  
  return {
    addToHistory,
    isInHistory,
    clearHistory,
    getHistorySize
  }
}