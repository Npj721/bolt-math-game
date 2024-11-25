<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useScoreStore } from '../stores/scores'
import { operations } from '../config/games'
import { useSessionHistory } from '../composables/useSessionHistory'
import ColumnAddition from './ColumnAddition.vue'

const props = defineProps(['level', 'operationType'])
const emit = defineEmits(['back'])

const scoreStore = useScoreStore()
const sessionHistory = useSessionHistory()
const userAnswers = ref({})
const showResult = ref(false)
const message = ref('')
const timeLeft = ref(0)
const timerInterval = ref(null)
const sessionProgress = ref(0)
const sessionScore = ref(0)
const sessionErrors = ref(0)
const sessionStartTime = ref(Date.now())
const showSessionSummary = ref(false)

const num1 = ref(0)
const num2 = ref(0)
const currentNumber = ref(0)

const operation = operations[props.operationType]
const score = computed(() => scoreStore.getScoreForLevel(props.level.id))

const correctAnswer = computed(() => {
  if (props.operationType === 'decomposition') {
    return operation.calculate(currentNumber.value)
  }
  return operation.calculate(num1.value, num2.value)
})

const decompositionPlaces = computed(() => {
  if (props.operationType !== 'decomposition') return []
  const places = ['unité', 'dizaine', 'centaine', 'millier']
  return correctAnswer.value.map(digit => ({
    ...digit,
    name: places[digit.position] + (digit.position > 0 ? 's' : '')
  })).reverse()
})

const timerWidth = computed(() => {
  return (timeLeft.value / props.level.timer) * 100 + '%'
})

const sessionTimeElapsed = computed(() => {
  return (Date.now() - sessionStartTime.value) / 1000
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
  
  if (props.operationType === 'decomposition') {
    await scoreStore.incrementErrors(props.level.id, {
      number: currentNumber.value,
      operationType: props.operationType
    })
  } else {
    await scoreStore.incrementErrors(props.level.id, {
      num1: num1.value,
      num2: num2.value,
      operationType: props.operationType
    })
  }
  
  message.value = '⏰ Temps écoulé!'
  
  if (sessionProgress.value < props.level.sessionSize.count - 1) {
    setTimeout(generateNewProblem, 2000)
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

function generateNewProblem() {
  if (props.operationType === 'decomposition') {
    const { number } = operation.generateNumbers(
      { min: props.level.min, max: props.level.max },
      (n) => sessionHistory.isInHistory(n)
    )
    currentNumber.value = number
    sessionHistory.addToHistory(number)
  } else {
    const numbers = operation.generateNumbers(
      { min: props.level.min, max: props.level.max },
      (nums) => sessionHistory.isInHistory({ ...nums, operationType: props.operationType })
    )
    num1.value = numbers.num1
    num2.value = numbers.num2
    sessionHistory.addToHistory({ ...numbers, operationType: props.operationType })
  }
  
  userAnswers.value = {}
  showResult.value = false
  startTimer()
}

async function checkAnswer(value) {
  clearInterval(timerInterval.value)
  showResult.value = true
  
  if (props.operationType === 'columnAddition') {
    const { answers, carries } = value
    let isCorrect = true
    let carry = 0
    
    for (let i = Object.keys(answers).length - 1; i >= 0; i--) {
      const digit1 = parseInt(num1.value.toString().padStart(4, '0')[i]) || 0
      const digit2 = parseInt(num2.value.toString().padStart(4, '0')[i]) || 0
      const expectedCarry = Math.floor((digit1 + digit2 + carry) / 10)
      const expectedDigit = (digit1 + digit2 + carry) % 10
      if (parseInt(answers[i]) !== expectedDigit || 
          (i > 0 && parseInt(carries[i-1] || 0) !== expectedCarry)) {
        isCorrect = false
        break
      }
      
      carry = expectedCarry
    }
    
    if (isCorrect) {
      await scoreStore.incrementCorrect(props.level.id)
      sessionScore.value++
      message.value = '🎉 Bravo! C\'est la bonne réponse!'
    } else {
      await scoreStore.incrementErrors(props.level.id, {
        num1: num1.value,
        num2: num2.value,
        operationType: props.operationType
      })
      sessionErrors.value++
      message.value = '❌ Oops! Ce n\'est pas la bonne réponse!'
    }
  } else if (props.operationType === 'decomposition') {
    const isCorrect = correctAnswer.value.every(digit => 
      parseInt(userAnswers.value[digit.position]) === digit.value
    )
    
    if (isCorrect) {
      await scoreStore.incrementCorrect(props.level.id)
      sessionScore.value++
      message.value = '🎉 Bravo! C\'est la bonne décomposition!'
    } else {
      await scoreStore.incrementErrors(props.level.id, {
        number: currentNumber.value,
        operationType: props.operationType
      })
      sessionErrors.value++
      message.value = '❌ Oops! Ce n\'est pas la bonne décomposition!'
    }
  } else {
    const answer = parseInt(userAnswers.value[0])
    if (answer === correctAnswer.value) {
      await scoreStore.incrementCorrect(props.level.id)
      sessionScore.value++
      message.value = '🎉 Bravo! C\'est la bonne réponse!'
    } else {
      await scoreStore.incrementErrors(props.level.id, {
        num1: num1.value,
        num2: num2.value,
        operationType: props.operationType
      })
      sessionErrors.value++
      message.value = '❌ Oops! Essaie encore!'
    }
  }
  
  if (sessionProgress.value < props.level.sessionSize.count - 1) {
    sessionProgress.value++
    setTimeout(generateNewProblem, 2000)
  } else {
    await finishSession()
  }
}

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})

// Démarrer la première question
generateNewProblem()
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
        Question {{ sessionProgress + 1 }}/{{ level.sessionSize.count }}
      </div>

      <div class="score-board">
        <p>✅ Score actuel: {{ sessionScore }}/{{ sessionProgress }}</p>
        <p>❌ Erreurs: {{ sessionErrors }}</p>
      </div>

      <div class="problem-container">
        <div class="timer-bar">
          <div class="timer-progress" :style="{ width: timerWidth }"></div>
          <div class="timer-text">{{ timeLeft }}s</div>
        </div>

        <template v-if="operationType === 'decomposition'">
          <div class="problem decomposition">
            <div class="number">{{ currentNumber }}</div>
            <div class="decomposition-inputs">
              <div v-for="place in decompositionPlaces" :key="place.position" class="place-input">
                <input 
                  type="number" 
                  v-model="userAnswers[place.position]"
                  :disabled="showResult"
                  @keyup.enter="checkAnswer"
                  placeholder="?"
                >
                <label>{{ place.name }}</label>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="operationType === 'columnAddition'">
          <ColumnAddition
            :num1="num1"
            :num2="num2"
            :showResult="showResult"
            v-model="userAnswers"
            @check="checkAnswer"
          />
        </template>
        <template v-else>
          <div class="problem">
            <span class="number">{{ num1 }}</span>
            <span class="operator">{{ operation.symbol }}</span>
            <span class="number">{{ num2 }}</span>
            <span class="operator">=</span>
            <input 
              type="number" 
              v-model="userAnswers[0]"
              :disabled="showResult"
              @keyup.enter="checkAnswer"
              placeholder="?"
            >
          </div>
          <button 
            @click="checkAnswer" 
            :disabled="!userAnswers[0] || showResult"
          >
            Vérifier
          </button>
        </template>

        <p class="message" :class="{ 'success': message.includes('Bravo') }">
          {{ showResult ? message : '&nbsp;' }}
        </p>
      </div>
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
  color:#666;
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
  color:#666;
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

.problem.decomposition {
  flex-direction: column;
  gap: 2rem;
}

.decomposition-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.place-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.place-input label {
  font-size: 0.9rem;
  color: #666;
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
  margin-top: 1rem;
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