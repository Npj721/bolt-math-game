import { defineStore } from 'pinia'
import { get, set } from 'idb-keyval'

const STORE_KEY = 'math-game-scores'

export const useScoreStore = defineStore('scores', {
  state: () => ({
    initialized: false,
    scores: {},
    errors: {} // { levelId: [{ num1, num2, operationType }] }
  }),
  actions: {
    async init() {
      if (this.initialized) return
      
      try {
        const data = await get(STORE_KEY)
        if (data) {
          if (data.scores) this.scores = JSON.parse(data.scores)
          if (data.errors) this.errors = JSON.parse(data.errors)
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
      await this.saveData()
    },
    async incrementErrors(levelId, problem) {
      if (!this.scores[levelId]) {
        this.scores[levelId] = { correct: 0, errors: 0 }
      }
      if (!this.errors[levelId]) {
        this.errors[levelId] = []
      }
      this.scores[levelId].errors++
      this.errors[levelId].push(problem)
      await this.saveData()
    },
    async removeError(levelId, index) {
      if (this.errors[levelId]) {
        this.errors[levelId].splice(index, 1)
        await this.saveData()
      }
    },
    getScoreForLevel(levelId) {
      return this.scores[levelId] || { correct: 0, errors: 0 }
    },
    getErrorsForLevel(levelId) {
      return this.errors[levelId] || []
    },
    async saveData() {
      try {
        await set(STORE_KEY, {
          scores: JSON.stringify(this.scores),
          errors: JSON.stringify(this.errors)
        })
      } catch (error) {
        console.error('Error saving data:', error)
      }
    }
  }
})