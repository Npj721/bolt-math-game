import { defineStore } from 'pinia'
import { get, set } from 'idb-keyval'

const STORE_KEY = 'math-game-scores'

export const useScoreStore = defineStore('scores', {
  state: () => ({
    initialized: false,
    scores: {}
  }),
  actions: {
    async init() {
      if (this.initialized) return
      
      try {
        const data = await get(STORE_KEY)
        if (data && data.scores) {
          this.scores = JSON.parse(data.scores)
        }
      } catch (error) {
        console.error('Error loading scores:', error)
      }
      
      this.initialized = true
    },
    async incrementCorrect(levelId) {
      if (!this.scores[levelId]) {
        this.scores[levelId] = { correct: 0, errors: 0 }
      }
      this.scores[levelId].correct++
      await this.saveScores()
    },
    async incrementErrors(levelId) {
      if (!this.scores[levelId]) {
        this.scores[levelId] = { correct: 0, errors: 0 }
      }
      this.scores[levelId].errors++
      await this.saveScores()
    },
    getScoreForLevel(levelId) {
      return this.scores[levelId] || { correct: 0, errors: 0 }
    },
    async saveScores() {
      try {
        await set(STORE_KEY, { scores: JSON.stringify(this.scores) })
      } catch (error) {
        console.error('Error saving scores:', error)
      }
    }
  }
})