<script setup>
import { ref, onMounted } from 'vue'
import { useScoreStore } from '../stores/scores'

const props = defineProps(['category'])
const scoreStore = useScoreStore()
const isLoading = ref(true)
const emit = defineEmits(['selectLevel', 'back'])

onMounted(async () => {
  await scoreStore.init()
  isLoading.value = false
})
</script>

<template>
  <div class="menu-container">
    <div class="menu-header">
      <button class="back-button" @click="$emit('back')">
        ← Retour au menu principal
      </button>
      <h1>{{ category.name }}</h1>
    </div>
    
    <div v-if="!isLoading" class="levels-grid">
      <div 
        v-for="level in category.levels" 
        :key="level.id"
        class="level-card"
        @click="$emit('selectLevel', level)"
      >
        <h2>{{ level.name }}</h2>
        <p>{{ level.description }}</p>
        <div class="score-info">
          <p>✅ {{ scoreStore.getScoreForLevel(level.id).correct }}</p>
          <p>❌ {{ scoreStore.getScoreForLevel(level.id).errors }}</p>
        </div>
      </div>
    </div>
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

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.level-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.level-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.level-card h2 {
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
</style>