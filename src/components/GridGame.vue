<script setup>
import { ref, onMounted, computed } from 'vue'
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
const sessionProgress = ref(0)
const sessionScore = ref(0)
const sessionErrors = ref(0)
const sessionStartTime = ref(Date.now())
const showSessionSummary = ref(false)

const sessionTimeElapsed = computed(() => {
  return (Date.now() - sessionStartTime.value) / 1000
})

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

async function handleTimeout() {
  showResult.value = true
  sessionErrors.value++
  message.value = '⏰ Temps écoulé!'
  
  if (sessionProgress.value < props.level.sessionSize.count - 1) {
    setTimeout(() => {
      sessionProgress.value++
      initGrid()
      startTimer()
      showResult.value = false
      message.value = ''
    }, 2000)
  } else {
    await finishSession()
  }
}

async function finishSession() {
  clearInterval(timerInterval.value)
  const totalTime = sessionTimeElapsed.value
  
  await scoreStore.saveSession(
    props.level.id,
    props.level.sessionSize.id,
    sessionScore.value,
    totalTime,
    sessionErrors.value
  )
  
  showSessionSummary.value = true
}

async function handleCellClick(row, col) {
  if (revealed.value[row][col] || showResult.value) return
  
  revealed.value[row][col] = true
  attempts.value++
  
  if (grid.value[row][col] === targetNumber.value) {
    showResult.value = true
    message.value = '🎉 Bravo! Tu as trouvé le nombre!'
    sessionScore.value++
    await scoreStore.incrementCorrect(props.level.id)
    
    if (sessionProgress.value < props.level.sessionSize.count - 1) {
      setTimeout(() => {
        sessionProgress.value++
        initGrid()
        startTimer()
        showResult.value = false
        message.value = ''
      }, 2000)
    } else {
      await finishSession()
    }
  } else if (attempts.value >= props.level.maxAttempts) {
    showResult.value = true
    message.value = '❌ Nombre d\'essais dépassé!'
    sessionErrors.value++
    await scoreStore.incrementErrors(props.level.id, {
      targetNumber: targetNumber.value,
      attempts: attempts.value
    })
    
    if (sessionProgress.value < props.level.sessionSize.count - 1) {
      setTimeout(() => {
        sessionProgress.value++
        initGrid()
        startTimer()
        showResult.value = false
        message.value = ''
      }, 2000)
    } else {
      await finishSession()
    }
  }
}
</script>

<template>
  <div class="game-container">
    <template v-if="!showSessionSummary">
      <div class="game-header">
        <button class="back-button" @click="$emit('back')">
          ← Retour au menu
        </button>
        <h1>{{ level.name }}</h1>
      </div>

      <div class="session-progress">
        Grille {{ sessionProgress + 1 }}/{{ level.sessionSize.count }}
      </div>

      <div class="score-board">
        <p>✅ Score actuel: {{ sessionScore }}/{{ sessionProgress }}</p>
        <p>❌ Erreurs: {{ sessionErrors }}</p>
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

      <p v-if="message !== ''" class="message" :class="{ 'success': message.includes('Bravo') }">
        {{ message }}
      </p>
    </template>

    <div v-else class="session-summary">
      <h2>Session terminée!</h2>
      <div class="summary-stats">
        <p>Score final: {{ sessionScore }}/{{ level.sessionSize.count }}</p>
        <p>Temps total: {{ Math.round(sessionTimeElapsed) }}s</p>
        <p>Erreurs: {{ sessionErrors }}</p>
      </div>
      <button class="back-button" @click="$emit('back')">
        Retour au menu
      </button>
    </div>
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

.session-progress {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
}

.score-board {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  font-size: 1.2rem;
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
  font-size: 1.2rem;
  border: 2px solid #42b883;
  background-color: white;
  color: #2c3e50;
  justify-items: center;
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
  position: fixed;
  top:7.5%;
  bottom: 7.5%;
  left:7.5%;
  right:7.5%;
  margin: auto;
  width: 85%;
  min-height: 1.5em;
  font-size: 3rem;
  color: #e74c3c;
  z-index: 35000;
  background-color:#0f2b1e;
  text-align: center;
  opacity: .95;
}

.message.success {
  color: #42b883;
}

.session-summary {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.session-summary h2 {
  color: #42b883;
  margin-bottom: 2rem;
}

.summary-stats {
  margin-bottom: 2rem;
}

.summary-stats p {
  font-size: 1.2rem;
  margin: 0.5rem 0;
  color: #2c3e50;
}
</style>