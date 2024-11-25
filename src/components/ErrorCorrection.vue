<script setup>
import { ref, computed } from 'vue'
import { useScoreStore } from '../stores/scores'
import { operations } from '../config/games'
import ColumnAddition from './ColumnAddition.vue'

const props = defineProps(['level', 'operationType'])
const emit = defineEmits(['back'])

const scoreStore = useScoreStore()
const userAnswer = ref('')
const userColumnAnswer = ref({})
const showResult = ref(false)
const message = ref('')
const currentErrorIndex = ref(0)

const errors = computed(() => scoreStore.getErrorsForLevel(props.level.id))
const currentError = computed(() => errors.value[currentErrorIndex.value])
const hasErrors = computed(() => errors.value.length > 0)
const operation = computed(() => operations[props.operationType])
const correctAnswer = computed(() => {
  if (!currentError.value) return null
  if (props.operationType === 'columnAddition') {
    return operation.value.calculate(
      currentError.value.num1,
      currentError.value.num2
    )
  }
  return operation.value.calculate(
    currentError.value.num1,
    currentError.value.num2
  )
})

async function checkAnswer(value) {
  showResult.value = true
  
  if (props.operationType === 'columnAddition') {
    const { answers, carries } = value
    let isCorrect = true
    let carry = 0
    
    for (let i = Object.keys(answers).length - 1; i >= 0; i--) {
      const digit1 = parseInt(currentError.value.num1.toString().padStart(4, '0')[i]) || 0
      const digit2 = parseInt(currentError.value.num2.toString().padStart(4, '0')[i]) || 0
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
      await scoreStore.removeError(props.level.id, currentErrorIndex.value)
      message.value = '🎉 Bravo! Tu as corrigé cette erreur!'
      
      if (currentErrorIndex.value >= errors.value.length) {
        currentErrorIndex.value = Math.max(0, errors.value.length - 1)
      }
    } else {
      message.value = '❌ Ce n\'est pas encore ça, essaie encore!'
    }
  } else {
    const answer = parseInt(userAnswer.value)
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
    userAnswer.value = ''
    userColumnAnswer.value = {}
  }, 2000)
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
          <ColumnAddition
            :num1="currentError.num1"
            :num2="currentError.num2"
            :showResult="showResult"
            v-model="userColumnAnswer"
            @check="checkAnswer"
          />
        </template>
        <template v-else>
          <div class="problem">
            <span class="number">{{ currentError.num1 }}</span>
            <span class="operator">{{ operation.symbol }}</span>
            <span class="number">{{ currentError.num2 }}</span>
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
        </template>

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

.return-button {
  margin-top: 1rem;
}
</style>