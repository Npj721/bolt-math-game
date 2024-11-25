<script setup>
import { reactive, computed, watch } from 'vue'

// Props
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

// Emits
const emit = defineEmits(['check', 'update:modelValue'])

// Reactive state for user answers and carries
const answers = reactive({
  0: null,
  1: null,
  2: null,
  3: null
})
const carries = reactive({
  0: null,
  1: null,
  2: null,
  3: null
})

// Computed: Split numbers into digits
const digits1 = computed(() => props.num1.toString().padStart(4, '0').split('').map(Number))
const digits2 = computed(() => props.num2.toString().padStart(4, '0').split('').map(Number))

// Watch for model updates
watch(
  () => ({ answers, carries }),
  () => {
    emit('update:modelValue', { answers, carries })
  },
  { deep: true }
)

// Watch showResult to reset values when it changes to false
watch(
  () => props.showResult,
  (newValue, oldValue) => {
    if (oldValue === true && newValue === false) {
      resetValues()
    }
  }
)

// Reset all values
function resetValues() {
  Object.keys(answers).forEach(key => {
    answers[key] = null
  })
  Object.keys(carries).forEach(key => {
    carries[key] = null
  })
}

// Validate and emit answers
function check() {
  Object.keys(answers).forEach(key => {
    if (answers[key] === null || answers[key] === "") {
      answers[key] = 0
    }
  })

  Object.keys(carries).forEach(key => {
    if (carries[key] === null || carries[key] === "") {
      carries[key] = 0
    }
  })
  
  const isValidAnswers = Object.values(answers).every(answer => answer !== null && answer !== '')
  const isValidCarries = Object.values(carries).every(carry => carry !== null && carry !== '')

  if (!isValidAnswers || !isValidCarries) {
    console.error('Incomplete data in answers or carries:', { answers, carries })
    return
  }

  emit('check', { answers, carries })
}
</script>

<template>
  <div class="column-addition">
    <div class="row">
      <div v-for="(carry, index) in carries" :key="'carry' + index" class="carry-cell">
        <input
          v-model="carries[index]"
          :disabled="showResult"
          type="number"
          placeholder=" "
          aria-label="Carry"
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
.column-addition {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.digit-cell,
.carry-cell,
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