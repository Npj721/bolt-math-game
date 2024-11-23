<script setup>
import { ref, onMounted } from 'vue'
import { gameCategories } from '../config/games'
import { useScoreStore } from '../stores/scores'

const scoreStore = useScoreStore()
const emit = defineEmits(['selectCategory'])
const isLoading = ref(true)

onMounted(async () => {
  await scoreStore.init()
  isLoading.value = false
})

function getTotalScore(categoryId) {
  return gameCategories
    .find(cat => cat.id === categoryId)?.levels
    .reduce((acc, level) => {
      const score = scoreStore.getScoreForLevel(level.id)
      return {
        correct: acc.correct + score.correct,
        errors: acc.errors + score.errors
      }
    }, { correct: 0, errors: 0 })
}
</script>

<template>
  <div class="menu-container">
    <h1>Jeu de Mathématiques</h1>
    <p class="subtitle">Choisis ton type d'exercice :</p>
    
    <div v-if="!isLoading" class="categories-grid">
      <div 
        v-for="category in gameCategories" 
        :key="category.id"
        class="category-card"
        @click="$emit('selectCategory', category)"
      >
        <h2>{{ category.name }}</h2>
        <div class="score-info">
          <p>✅ {{ getTotalScore(category.id)?.correct || 0 }}</p>
          <p>❌ {{ getTotalScore(category.id)?.errors || 0 }}</p>
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
  text-align: center;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.category-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.category-card h2 {
  color: #42b883;
  margin-bottom: 1rem;
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