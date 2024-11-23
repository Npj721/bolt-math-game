<script setup>
import { ref, onMounted } from 'vue'
import { useScoreStore } from './stores/scores'
import MainMenu from './components/MainMenu.vue'
import GameMenu from './components/GameMenu.vue'
import MathGame from './components/MathGame.vue'

const selectedCategory = ref(null)
const selectedLevel = ref(null)
const scoreStore = useScoreStore()

onMounted(async () => {
  await scoreStore.init()
})

function handleCategorySelect(category) {
  selectedCategory.value = category
  selectedLevel.value = null
}

function handleLevelSelect(level) {
  selectedLevel.value = level
}

function returnToMainMenu() {
  selectedCategory.value = null
  selectedLevel.value = null
}

function returnToCategoryMenu() {
  selectedLevel.value = null
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
        @back="returnToMainMenu"
      />
    </template>
    
    <template v-else>
      <MathGame 
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