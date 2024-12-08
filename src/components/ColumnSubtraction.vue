<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  num1: {
    type: Number,
    required: true
  },
  num2: {
    type: Number,
    required: true
  },
  showResult: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['check', 'update:modelValue'])

const answers = reactive({
  0: null,
  1: null,
  2: null,
  3: null
})

const borrows = reactive({
  0: null,
  1: null,
  2: null,
  3: null
})

const digits1 = computed(() => String(props.num1).padStart(4, '0').split('').map(Number))
const digits2 = computed(() => String(props.num2).padStart(4, '0').split('').map(Number))

watch(
  () => ({ answers, borrows }),
  () => {
    emit('update:modelValue', { answers, borrows })
  },
  { deep: true }
)

watch(
  () => props.showResult,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      resetValues()
    }
  }
)

function resetValues() {
  Object.keys(answers).forEach(key => {
    answers[key] = null
  })
  Object.keys(borrows).forEach(key => {
    borrows[key] = null
  })
}

function validateSubtraction() {
  if (!props.num1 || !props.num2) {
    console.error('Invalid numbers for subtraction')
    return false
  }

  let digits1Copy = [...digits1.value]
  
  // Validate borrows
  for (let i = digits1Copy.length - 1; i >= 0; i--) {
    if (parseInt(borrows[i] || 0) === 1) {
      if (i > 0) {
        digits1Copy[i-1]--
        digits1Copy[i] += 10
      } else {
        return false
      }
    }
  }

  // Validate each digit
  for (let i = digits1Copy.length - 1; i >= 0; i--) {
    const expectedDigit = digits1Copy[i] - digits2.value[i]
    if (expectedDigit < 0 || parseInt(answers[i]) !== expectedDigit) {
      return false
    }
  }

  return true
}

function check() {
  // Ensure all answers and borrows have values (default to 0 if empty)
  Object.keys(answers).forEach(key => {
    if (answers[key] === null || answers[key] === "") {
      answers[key] = 0
    }
  })

  Object.keys(borrows).forEach(key => {
    if (borrows[key] === null || borrows[key] === "") {
      borrows[key] = 0
    }
  })

  const isValid = validateSubtraction()
  emit('check', { answers, borrows, isCorrect: isValid })
}
</script>

<template>
  <div class="column-subtraction">
    <div class="row">
      <div v-for="(borrow, index) in borrows" :key="'borrow' + index" class="borrow-cell">
        <input
          v-model="borrows[index]"
          :disabled="showResult"
          type="number"
          min="0"
          max="1"
          placeholder=" "
          aria-label="Borrow"
        />
      </div>
    </div>
    <div class="row">
      <div v-for="(digit, index) in digits1" :key="'num1' + index" class="digit-cell">
        <span>{{ digit }}</span>
      </div>
    </div>
    <div class="row">
      <div v-for="(digit, index) in digits2" :key="'num2' + index" class="digit-cell">
        <span>{{ digit }}</span>
      </div>
    </div>
    <div class="row">
      <div v-for="(answer, index) in answers" :key="'answer' + index" class="answer-cell">
        <input
          v-model="answers[index]"
          :disabled="showResult"
          type="number"
          min="0"
          max="9"
          placeholder="?"
          aria-label="Answer"
        />
      </div>
    </div>
    <button 
      class="check-button"
      @click="check"
      :disabled="showResult"
    >
      Vérifier
    </button>
  </div>
</template>

<style scoped>
.column-subtraction {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #666;
}

.row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.digit-cell,
.borrow-cell,
.answer-cell {
  width: 50px;
  text-align: center;
}

input {
  width: 100%;
  height: 50px;
  font-size: 1.2rem;
  text-align: center;
  border: 2px solid #42b883;
  background-color: white;
  color: #666;
  border-radius: 8px;
}

input:focus {
  border-color: #3aa876;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

button.check-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.8em 2em;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button.check-button:hover:not(:disabled) {
  background-color: #3aa876;
}

button.check-button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}
</style>