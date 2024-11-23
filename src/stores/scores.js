import { defineStore } from 'pinia'
import { get, set } from 'idb-keyval'

const STORE_KEY = 'math-game-scores'
const SESSIONS_KEY = 'math-game-sessions'

export const useScoreStore = defineStore('scores', {
  state: () => ({
    initialized: false,
    scores: {},
    errors: {},
    sessions: {} // { levelId: { sessionSize: [{ date, score, totalTime, errors }] } }
  }),
  actions: {
    async init() {
      if (this.initialized) return
      
      try {
        const data = await get(STORE_KEY)
        const sessionsData = await get(SESSIONS_KEY)
        
        if (data) {
          if (data.scores) this.scores = JSON.parse(data.scores)
          if (data.errors) this.errors = JSON.parse(data.errors)
        }
        
        if (sessionsData) {
          this.sessions = JSON.parse(sessionsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
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
    async saveSession(levelId, sessionSize, score, totalTime, errors) {
      if (!this.sessions[levelId]) {
        this.sessions[levelId] = {}
      }
      if (!this.sessions[levelId][sessionSize]) {
        this.sessions[levelId][sessionSize] = []
      }
      
      const session = {
        date: new Date().toISOString(),
        score,
        totalTime,
        errors
      }
      
      this.sessions[levelId][sessionSize].push(session)
      this.sessions[levelId][sessionSize].sort((a, b) => b.score - a.score)
      
      await set(SESSIONS_KEY, JSON.stringify(this.sessions))
    },
    getSessionHistory(levelId, sessionSize) {
      return this.sessions[levelId]?.[sessionSize] || []
    },
    getBestSession(levelId, sessionSize) {
      const sessions = this.getSessionHistory(levelId, sessionSize)
      return sessions[0] || null
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