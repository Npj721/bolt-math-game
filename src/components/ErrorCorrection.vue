<script setup>
import { ref, computed } from 'vue'
import { useScoreStore } from '../stores/scores'
import { operations } from '../config/games'
import ColumnAddition from './ColumnAddition.vue'
import ColumnSubtraction from './ColumnSubtraction.vue'
import GridGame from './GridGame.vue'

const props = defineProps(['level', 'operationType'])
const emit = defineEmits(['back'])

const scoreStore = useScoreStore()
const userAnswer = ref({})
const userColumnAnswer = ref({})
const showResult = ref(false)
const showCorrectAnswer = ref(false)
const message = ref('')
const currentErrorIndex = ref(0)

const errors = computed(() => scoreStore.getErrorsForLevel(props.level.id))
const currentError = computed(() => errors.value[currentErrorIndex.value])
const hasErrors = computed(() => errors.value.length > 0)
const operation = computed(() => operations[props.operationType])
const correctAnswer = computed(() => {
  if (!currentError.value) return null
  if (props.operationType === 'columnAddition' || props.operationType === 'columnSubtraction') {
    return operation.value.calculate(
      currentError.value.num1,
      currentError.value.num2
    )
  }
  if (props.operationType === 'decomposition') {
    return operation.value.calculate(currentError.value.number)
  }
  if (props.operationType === 'grid') {
    return currentError.value.targetNumber
  }
  return operation.value.calculate(
    currentError.value.num1,
    currentError.value.num2
  )
})

const correctColumnAnswer = computed(() => {
  if (!currentError.value || (props.operationType !== 'columnAddition' && props.operationType !== 'columnSubtraction')) {
    return null
  }

  const num1 = currentError.value.num1.toString().padStart(4, '0').split('').map(Number)
  const num2 = currentError.value.num2.toString().padStart(4, '0').split('').map(Number)
  const result = correctAnswer.value.toString().padStart(4, '0').split('').map(Number)
  
  if (props.operationType === 'columnAddition') {
    const carries = { 0: 0, 1: 0, 2: 0, 3: 0 }
    let carry = 0
    for (let i = 3; i >= 0; i--) {
      const sum = num1[i] + num2[i] + carry
      carry = Math.floor(sum / 10)
      if (carry > 0 && i > 0) {
        carries[i - 1] = carry
      }
    }
    return { answers: result, carries }
  } else {
    const borrows = { 0: 0, 1: 0, 2: 0, 3: 0 }
    let num1Copy = [...num1]
    for (let i = 3; i >= 0; i--) {
      if (num1Copy[i] < num2[i]) {
        if (i > 0) {
          borrows[i] = 1
          num1Copy[i] += 10
          num1Copy[i - 1] -= 1
        }
      }
    }
    return { answers: result, borrows }
  }
})

const decompositionPlaces = computed(() => {
  if (props.operationType !== 'decomposition' || !currentError.value) return []
  const places = ['unité', 'dizaine', 'centaine', 'millier']
  return correctAnswer.value.map(digit => ({
    ...digit,
    name: places[digit.position] + (digit.position > 0 ? 's' : '')
  })).reverse()
})

async function checkAnswer(value) {
  showResult.value = true
  showCorrectAnswer.value = false
  
  if (props.operationType === 'columnAddition' || props.operationType === 'columnSubtraction') {
    const isCorrect = value.isCorrect
    
    if (isCorrect) {
      await scoreStore.incrementCorrect(props.level.id)
      await scoreStore.removeError(props.level.id, currentErrorIndex.value)
      message.value = '🎉 Bravo! Tu as corrigé cette erreur!'
      
      if (currentErrorIndex.value >= errors.value.length) {
        currentErrorIndex.value = Math.max(0, errors.value.length - 1)
      }
    } else {
      message.value = '❌ Ce n\'est pas encore ça, essaie encore!'
    }
  } else if (props.operationType === 'decomposition') {
    const isCorrect = correctAnswer.value.every(digit => 
      parseInt(userAnswer.value[digit.position]) === digit.value
    )
    
    if (isCorrect) {
      await scoreStore.incrementCorrect(props.level.id)
      await scoreStore.removeError(props.level.id, currentErrorIndex.value)
      message.value = '🎉 Bravo! Tu as corrigé cette erreur!'
      
      if (currentErrorIndex.value >= errors.value.length) {
        currentErrorIndex.value = Math.max(0, errors.value.length - 1)
      }
    } else {
      message.value = '❌ Ce n\'est pas encore ça, essaie encore!'
    }
  } else if (props.operationType === 'grid') {
    const isCorrect = value === correctAnswer.value
    
    if (isCorrect) {
      await scoreStore.incrementCorrect(props.level.id)
      await scoreStore.removeError(props.level.id, currentErrorIndex.value)
      message.value = '🎉 Bravo! Tu as corrigé cette erreur!'
      
      if (currentErrorIndex.value >= errors.value.length) {
        currentErrorIndex.value = Math.max(0, errors.value.length - 1)
      }
    } else {
      message.value = '❌ Ce n\'est pas encore ça, essaie encore!'
    }
  } else {
    const answer = parseInt(userAnswer.value[0])
    if (answer === correctAnswer.value) {
      await scoreStore.incrementCorrect(props.level.id)
      await scoreStore.removeError(props.level.id, currentErrorIndex.value)
      message.value = '🎉 Bravo! Tu as corrigé cette erreur!'
      
      if (currentErrorIndex.value >= errors.value.length) {
        currentErrorIndex.value = Math.max(0, errors.value.length - 1)
      }
    } else {
      message.value = '❌ Ce n\'est pas encore ça, essaie encore!'
    }
  }
  
  setTimeout(() => {
    showResult.value = false
    message.value = ''
    userAnswer.value = {}
    userColumnAnswer.value = {}
  }, 2000)
}

function revealAnswer() {
  showCorrectAnswer.value = true
}
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <button class="back-button" @click="$emit('back')">
        ← Retour au menu
      </button>
      <h1>Correction des erreurs - {{ level.name }}</h1>
    </div>

    <div v-if="!hasErrors" class="no-errors">
      <p>🎉 Aucune erreur à corriger !</p>
      <button @click="$emit('back')" class="return-button">
        Retourner au menu
      </button>
    </div>

    <template v-else>
      <div class="progress">
        Erreur {{ currentErrorIndex + 1 }} sur {{ errors.length }}
      </div>

      <div class="problem-container">
        <template v-if="operationType === 'columnAddition'">
          <div class="correct-answer" v-if="showCorrectAnswer">
            <p class="hint-text">La bonne réponse est :</p>
            <ColumnAddition
              :num1="currentError.num1"
              :num2="currentError.num2"
              :showResult="true"
              :correctAnswer="correctColumnAnswer"
              v-model="userColumnAnswer"
              @check="checkAnswer"
            />
          </div>
          <ColumnAddition
            v-else
            :num1="currentError.num1"
            :num2="currentError.num2"
            :showResult="showResult"
            v-model="userColumnAnswer"
            @check="checkAnswer"
          />
        </template>
        <template v-else-if="operationType === 'columnSubtraction'">
          <div class="correct-answer" v-if="showCorrectAnswer">
            <p class="hint-text">La bonne réponse est :</p>
            <ColumnSubtraction
              :num1="currentError.num1"
              :num2="currentError.num2"
              :showResult="true"
              :correctAnswer="correctColumnAnswer"
              v-model="userColumnAnswer"
              @check="checkAnswer"
            />
          </div>
          <ColumnSubtraction
            v-else
            :num1="currentError.num1"
            :num2="currentError.num2"
            :showResult="showResult"
            v-model="userColumnAnswer"
            @check="checkAnswer"
          />
        </template>
        <template v-else-if="operationType === 'grid'">
          <GridGame
            :level="level"
            :savedState="currentError"
            @check="checkAnswer"
            @back="$emit('back')"
          />
        </template>
        <template v-else-if="operationType === 'decomposition'">
          <div class="problem decomposition">
            <div class="number">{{ currentError.number }}</div>
            <div class="decomposition-inputs">
              <div v-for="place in decompositionPlaces" :key="place.position" class="place-input">
                <input 
                  type="number" 
                  v-model="userAnswer[place.position]"
                  :disabled="showResult"
                  @keyup.enter="checkAnswer"
                  placeholder="?"
                >
                <label>{{ place.name }}</label>
                <span v-if="showCorrectAnswer" class="correct-value">
                  Réponse : {{ place.value }}
                </span>
              </div>
            </div>
            <button 
              @click="checkAnswer" 
              :disabled="Object.keys(userAnswer).length !== decompositionPlaces.length"
              class="verify-button"
            >
              Vérifier
            </button>
          </div>
        </template>
        <template v-else>
          <div class="problem">
            <span class="number">{{ currentError.num1 }}</span>
            <span class="operator">{{ operation.symbol }}</span>
            <span class="number">{{ currentError.num2 }}</span>
            <span class="operator">=</span>
            <input 
              type="number" 
              v-model="userAnswer[0]"
              :disabled="showResult"
              @keyup.enter="checkAnswer"
              placeholder="?"
            >
            <span v-if="showCorrectAnswer" class="correct-value">
              Réponse : {{ correctAnswer }}
            </span>
          </div>

          <button 
            @click="checkAnswer" 
            :disabled="!userAnswer[0]"
          >
            Vérifier
          </button>
        </template>

        <button 
          @click="revealAnswer"
          class="reveal-button"
          :disabled="showResult || showCorrectAnswer"
        >
          Révéler la réponse
        </button>

        <p class="message" :class="{ 'success': message.includes('Bravo') }">
          {{ showResult ? message : '&nbsp;' }}
        </p>
      </div>
    </template>
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

.progress {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #666;
}

.no-errors {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.no-errors p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color:#3aa876;
}

.problem-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.verify-button {
  margin-top: 2rem;
}

.return-button {
  margin-top: 1rem;
}

.reveal-button {
  background-color: #e67e22;
  margin-left: 1rem;
}

.reveal-button:hover:not(:disabled) {
  background-color: #d35400;
}

.correct-answer {
  margin-bottom: 2rem;
}

.hint-text {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.correct-value {
  color: #e67e22;
  font-size: 1rem;
  margin-top: 0.5rem;
}
</style>