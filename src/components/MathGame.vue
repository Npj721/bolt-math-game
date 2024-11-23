<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useScoreStore } from '../stores/scores'
import { operations } from '../config/games'

const props = defineProps(['level', 'operationType'])
const emit = defineEmits(['back'])

const scoreStore = useScoreStore()
const userAnswer = ref('')
const showResult = ref(false)
const message = ref('')
const timeLeft = ref(0)
const timerInterval = ref(null)

const num1 = ref(0)
const num2 = ref(0)

const operation = operations[props.operationType]
const score = computed(() => scoreStore.getScoreForLevel(props.level.id))
const correctAnswer = computed(() => operation.calculate(num1.value, num2.value))

const timerWidth = computed(() => {
  return (timeLeft.value / props.level.timer) * 100 + '%'
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
  await scoreStore.incrementErrors(props.level.id, {
    num1: num1.value,
    num2: num2.value,
    operationType: props.operationType
  })
  message.value = '⏰ Temps écoulé!'
  setTimeout(generateNewProblem, 2000)
}

function generateNewProblem() {
  const numbers = operation.generateNumbers({
    min: props.level.min,
    max: props.level.max
  })
  num1.value = numbers.num1
  num2.value = numbers.num2
  userAnswer.value = ''
  showResult.value = false
  startTimer()
}

async function checkAnswer() {
  clearInterval(timerInterval.value)
  const answer = parseInt(userAnswer.value)
  showResult.value = true
  
  if (answer === correctAnswer.value) {
    await scoreStore.incrementCorrect(props.level.id)
    message.value = '🎉 Bravo! C\'est la bonne réponse!'
  } else {
    await scoreStore.incrementErrors(props.level.id, {
      num1: num1.value,
      num2: num2.value,
      operationType: props.operationType
    })
    message.value = '❌ Oops! Essaie encore!'
  }
  
  setTimeout(generateNewProblem, 2000)
}

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})

// Générer le premier problème au chargement
generateNewProblem()
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <button class="back-button" @click="$emit('back')">
        ← Retour au menu
      </button>
      <h1>{{ level.name }}</h1>
    </div>

    <div class="score-board">
      <p>✅ Bonnes réponses: {{ score.correct }}</p>
      <p>❌ Erreurs: {{ score.errors }}</p>
    </div>

    <div class="problem-container">
      <div class="timer-bar">
        <div class="timer-progress" :style="{ width: timerWidth }"></div>
        <div class="timer-text">{{ timeLeft }}s</div>
      </div>

      <div class="problem">
        <span class="number">{{ num1 }}</span>
        <span class="operator">{{ operation.symbol }}</span>
        <span class="number">{{ num2 }}</span>
        <span class="operator">=</span>
        <input 
          type="number" 
          v-model="userAnswer"
          :disabled="showResult"
          @keyup.enter="checkAnswer"
          placeholder="?"
        >
      </div>

      <button 
        @click="checkAnswer" 
        :disabled="!userAnswer || showResult"
      >
        Vérifier
      </button>

      <p class="message" :class="{ 'success': message.includes('Bravo') }">
        {{ showResult ? message : '&nbsp;' }}
      </p>
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

.score-board {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.problem-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.problem {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.number {
  font-weight: bold;
  color: #2c3e50;
}

.operator {
  color: #42b883;
}

input {
  width: 80px;
  height: 50px;
  font-size: 2rem;
  text-align: center;
  border: 2px solid #42b883;
  border-radius: 8px;
  outline: none;
}

input:focus {
  border-color: #3aa876;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.8em 2em;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #3aa876;
}

button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

.message {
  min-height: 1.5em;
  margin-top: 1rem;
  font-size: 1.2rem;
  color: #e74c3c;
}

.message.success {
  color: #42b883;
}
</style>