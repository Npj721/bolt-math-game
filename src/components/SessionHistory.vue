<script setup>
import { computed } from 'vue'
import { useScoreStore } from '../stores/scores'
import { sessionSizes } from '../config/games'

const props = defineProps(['level'])
const emit = defineEmits(['close'])
const scoreStore = useScoreStore()

const sessionHistory = computed(() => {
  return sessionSizes.map(session => ({
    ...session,
    history: scoreStore.getSessionHistory(props.level.id, session.id)
  }))
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="history-container">
    <div class="history-header">
      <h2>Historique - {{ level.name }}</h2>
      <button class="close-button" @click="$emit('close')">×</button>
    </div>

    <div class="sessions-container">
      <div v-for="session in sessionHistory" :key="session.id" class="session-history">
        <h3>Session {{ session.name }} ({{ session.count }} calculs)</h3>
        
        <div v-if="session.history.length" class="history-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Temps</th>
                <th>Erreurs</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in session.history" :key="index">
                <td>{{ formatDate(record.date) }}</td>
                <td>{{ record.score }}/{{ session.count }}</td>
                <td>{{ Math.round(record.totalTime) }}s</td>
                <td>{{ record.errors }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="no-data">Aucune session terminée</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.sessions-container {
  display: grid;
  gap: 2rem;
}

.session-history h3 {
  color: #42b883;
  margin-bottom: 1rem;
}

.history-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

tr:hover {
  background-color: #f8f9fa;
}

.no-data {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}
</style>