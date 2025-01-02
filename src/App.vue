<script setup>
import { ref, onMounted, watch } from 'vue'
import { useScoreStore } from './stores/scores'
import MainMenu from './components/MainMenu.vue'
import GameMenu from './components/GameMenu.vue'
import MathGame from './components/MathGame.vue'
import ErrorCorrection from './components/ErrorCorrection.vue'

import { useDeviceReady } from './helpers/useDeviceReady';



const selectedCategory = ref(null)
const selectedLevel = ref(null)
const isCorrection = ref(false)
const scoreStore = useScoreStore()

const { isReady } = useDeviceReady();

// Déclaration réactive des informations sur l'appareil
const deviceInfo = ref({
  platform: 'Inconnu',
  version: 'Inconnu',
  uuid: 'Inconnu',
  device: ''
});

// Surveillez `isReady` et mettez à jour `deviceInfo` lorsqu'il est prêt
watch(isReady, (ready) => {
  if (ready && window.device) {
    deviceInfo.value = {
      platform: window.device.platform || 'Inconnu',
      version: window.device.version || 'Inconnu',
      uuid: window.device.uuid || 'Inconnu',
      device: window.device || { }
    };
  }
});


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
  width:100%;
  background-color: #f5f5f5;
}
</style>