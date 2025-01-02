<script setup>
import { ref, onMounted } from 'vue'
import { useScoreStore } from '../stores/scores'
import { useGrid } from '../composables/useGrid'

const props = defineProps({
  level: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back'])
const scoreStore = useScoreStore()
const { grid, revealed, targetNumber, attempts, initGrid } = useGrid(props.level)
const message = ref('')
const showResult = ref(false)
const timeLeft = ref(props.level.timer)
const timerInterval = ref(null)

onMounted(() => {
  initGrid()
  startTimer()
})

function startTimer() {
  timeLeft.value = props.level.timer
  if (timerInterval.value) clearInterval(timerInterval.value)
  
  timerInterval.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval.value)
      handleTimeout()
    }
  }, 1000)
}

function handleTimeout() {
  showResult.value = true
  message.value = '⏰ Temps écoulé!'
  setTimeout(() => {
    initGrid()
    startTimer()
    showResult.value = false
    message.value = ''
  }, 2000)
}

function handleCellClick(row, col) {
  if (revealed.value[row][col] || showResult.value) return
  
  revealed.value[row][col] = true
  attempts.value++
  
  if (grid.value[row][col] === targetNumber.value) {
    showResult.value = true
    message.value = '🎉 Bravo! Tu as trouvé le nombre!'
    scoreStore.incrementCorrect(props.level.id)
    setTimeout(() => {
      initGrid()
      startTimer()
      showResult.value = false
      message.value = ''
    }, 2000)
  } else if (attempts.value >= props.level.maxAttempts) {
    showResult.value = true
    message.value = '❌ Nombre d\'essais dépassé!'
    scoreStore.incrementErrors(props.level.id, {
      targetNumber: targetNumber.value,
      attempts: attempts.value
    })
    setTimeout(() => {
      initGrid()
      startTimer()
      showResult.value = false
      message.value = ''
    }, 2000)
  }
}
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <button class="back-button" @click="$emit('back')">
        ← Retour au menu
      </button>
      <h1>{{ level.name }}</h1>
    </div>

    <div class="timer-bar">
      <div 
        class="timer-progress" 
        :style="{ width: (timeLeft / level.timer * 100) + '%' }"
      ></div>
      <div class="timer-text">{{ timeLeft }}s</div>
    </div>

    <div class="target-number">
      Trouve le nombre : <span class="number">{{ targetNumber }}</span>
    </div>

    <div class="attempts">
      Essais restants : {{ level.maxAttempts - attempts }}
    </div>

    <div class="grid">
      <div 
        v-for="(row, rowIndex) in grid" 
        :key="rowIndex"
        class="grid-row"
      >
        <button
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="grid-cell"
          :class="{ 
            'revealed': revealed[rowIndex][colIndex],
            'target': revealed[rowIndex][colIndex] && cell === targetNumber
          }"
          @click="handleCellClick(rowIndex, colIndex)"
          :disabled="revealed[rowIndex][colIndex] || showResult"
        >
          {{ revealed[rowIndex][colIndex] ? cell : '?' }}
        </button>
      </div>
    </div>

    <p class="message" :class="{ 'success': message.includes('Bravo') }">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.game-header h1 {
  color: #666;
}

.back-button {
  background-color: #666;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #555;
}

.timer-bar {
  position: relative;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.timer-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #42b883;
  transition: width 1s linear;
}

.timer-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
  font-weight: bold;
  z-index: 1;
}

.target-number {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.target-number .number {
  font-weight: bold;
  color: #42b883;
}

.attempts {
  margin-bottom: 2rem;
  color: #666;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.grid-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.grid-cell {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  border: 2px solid #42b883;
  background-color: white;
  color: #2c3e50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.grid-cell:hover:not(:disabled) {
  background-color: #f0f9f6;
}

.grid-cell.revealed {
  background-color: #f0f9f6;
  cursor: default;
}

.grid-cell.target {
  background-color: #42b883;
  color: white;
}

.grid-cell:disabled {
  cursor: default;
  opacity: 0.8;
}

.message {
  min-height: 1.5em;
  font-size: 1.2rem;
  color: #e74c3c;
}

.message.success {
  color: #42b883;
}
</style>