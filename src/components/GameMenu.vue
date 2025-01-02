<script setup>
import { ref, onMounted } from 'vue'
import { useScoreStore } from '../stores/scores'
import { sessionSizes } from '../config/games'
import SessionHistory from './SessionHistory.vue'

const props = defineProps(['category'])
const scoreStore = useScoreStore()
const isLoading = ref(true)
const selectedLevel = ref(null)
const showHistory = ref(false)
const emit = defineEmits(['selectLevel', 'back', 'correctErrors'])

onMounted(async () => {
  await scoreStore.init()
  isLoading.value = false
})

function hasErrors(levelId) {
  const errors = scoreStore.getErrorsForLevel(levelId)
  return errors.length > 0
}

function selectLevel(level) {
  selectedLevel.value = level
}

function startSession(sessionSize) {
  emit('selectLevel', { ...selectedLevel.value, sessionSize })
  selectedLevel.value = null
}

function closeHistory() {
  showHistory.value = false
  selectedLevel.value = null
}
</script>

<template>
  <div class="menu-container">
    <div class="menu-header">
      <button class="back-button" @click="$emit('back')">
        ← Retour au menu principal
      </button>
      <h1>{{ category.name }}</h1>
    </div>
    
    <div v-if="!isLoading && !selectedLevel && !showHistory" class="levels-grid">
      <div 
        v-for="level in category.levels" 
        :key="level.id"
        class="level-card"
      >
        <h2>{{ level.name }}</h2>
        <p>{{ level.description }}</p>
        <div class="score-info">
          <p>✅ {{ scoreStore.getScoreForLevel(level.id).correct }}</p>
          <p>❌ {{ scoreStore.getScoreForLevel(level.id).errors }}</p>
        </div>
        <div class="button-group">
          <button 
            class="practice-button"
            @click="selectLevel(level)"
          >
            S'entraîner
          </button>
          <button 
            v-if="hasErrors(level.id)"
            class="correction-button"
            @click="$emit('correctErrors', level)"
          >
            Corriger les erreurs
          </button>
          <button
            class="history-button"
            @click="selectedLevel = level; showHistory = true"
          >
            Historique
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="selectedLevel && !showHistory" class="session-selection">
      <h2>{{ selectedLevel.name }} - Choisir la durée de la session</h2>
      <div class="session-grid">
        <div 
          v-for="session in sessionSizes"
          :key="session.id"
          class="session-card"
          @click="startSession(session)"
        >
          <h3>{{ session.name }}</h3>
          <p>{{ session.count }} {{ category.id === 'grid' ? 'grilles' : 'calculs' }}</p>
          <div class="best-score" v-if="scoreStore.getBestSession(selectedLevel.id, session.id)">
            <p>Meilleur score: {{ scoreStore.getBestSession(selectedLevel.id, session.id).score }}</p>
            <p>Meilleur temps: {{ Math.round(scoreStore.getBestSession(selectedLevel.id, session.id).totalTime) }}s</p>
          </div>
        </div>
      </div>
      <button class="back-button" @click="selectedLevel = null">Retour</button>
    </div>

    <SessionHistory
      v-else-if="showHistory"
      :level="selectedLevel"
      @close="closeHistory"
    />
  </div>
</template>

<style scoped>
.menu-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
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

.levels-grid, .session-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.level-card, .session-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.session-card:hover {
  transform: translateY(-5px);
}

.level-card h2, .session-card h3 {
  color: #42b883;
  margin-bottom: 1rem;
}

.level-card p {
  color: #666;
}

.score-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.score-info p {
  font-size: 1.1rem;
  color: #2c3e50;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.practice-button {
  background-color: #42b883;
  color: white;
}

.correction-button {
  background-color: #e67e22;
  color: white;
}

.history-button {
  background-color: #3498db;
  color: white;
}

.practice-button:hover {
  background-color: #3aa876;
}

.correction-button:hover {
  background-color: #d35400;
}

.history-button:hover {
  background-color: #2980b9;
}

.session-selection {
  text-align: center;
}

.session-selection h2 {
  margin-bottom: 2rem;
  color:#666;
}

.best-score {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #666;
}
</style>