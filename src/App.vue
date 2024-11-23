<script setup>
import { ref, onMounted } from 'vue'
import { useScoreStore } from './stores/scores'
import MainMenu from './components/MainMenu.vue'
import GameMenu from './components/GameMenu.vue'
import MathGame from './components/MathGame.vue'
import ErrorCorrection from './components/ErrorCorrection.vue'

const selectedCategory = ref(null)
const selectedLevel = ref(null)
const isCorrection = ref(false)
const scoreStore = useScoreStore()

onMounted(async () => {
  await scoreStore.init()
})

function handleCategorySelect(category) {
  selectedCategory.value = category
  selectedLevel.value = null
  isCorrection.value = false
}

function handleLevelSelect(level) {
  selectedLevel.value = level
  isCorrection.value = false
}

function handleCorrectErrors(level) {
  selectedLevel.value = level
  isCorrection.value = true
}

function returnToMainMenu() {
  selectedCategory.value = null
  selectedLevel.value = null
  isCorrection.value = false
}

function returnToCategoryMenu() {
  selectedLevel.value = null
  isCorrection.value = false
}
</script>

<template>
  <div class="app-container">
    <template v-if="!selectedCategory">
      <MainMenu @select-category="handleCategorySelect" />
    </template>
    
    <template v-else-if="!selectedLevel">
      <GameMenu 
        :category="selectedCategory"
        @select-level="handleLevelSelect"
        @correct-errors="handleCorrectErrors"
        @back="returnToMainMenu"
      />
    </template>
    
    <template v-else>
      <MathGame 
        v-if="!isCorrection"
        :level="selectedLevel"
        :operation-type="selectedCategory.id"
        @back="returnToCategoryMenu"
      />
      <ErrorCorrection
        v-else
        :level="selectedLevel"
        :operation-type="selectedCategory.id"
        @back="returnToCategoryMenu"
      />
    </template>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}
</style>