export const operations = {
  addition: {
    calculate: (a, b) => a + b,
    symbol: '+',
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const num1 = Math.floor(Math.random() * (max - min + 1)) + min
        const num2 = Math.floor(Math.random() * (max - min + 1)) + min
        if (!isInHistory({ num1, num2 })) {
          return { num1, num2 }
        }
        attempts++
      }
      return {
        num1: Math.floor(Math.random() * (max - min + 1)) + min,
        num2: Math.floor(Math.random() * (max - min + 1)) + min
      }
    }
  },
  columnAddition: {
    calculate: (a, b) => a + b,
    symbol: '+',
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const num1 = Math.floor(Math.random() * (max - min + 1)) + min
        const num2 = Math.floor(Math.random() * (max - min + 1)) + min
        if (!isInHistory({ num1, num2 })) {
          return { num1, num2 }
        }
        attempts++
      }
      return {
        num1: Math.floor(Math.random() * (max - min + 1)) + min,
        num2: Math.floor(Math.random() * (max - min + 1)) + min
      }
    }
  },
  columnSubtraction: {
    calculate: (a, b) => a - b,
    symbol: '-',
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const num2 = Math.floor(Math.random() * (max - min + 1)) + min
        const num1 = num2 + Math.floor(Math.random() * (max - num2)) + min
        if (!isInHistory({ num1, num2 })) {
          return { num1, num2 }
        }
        attempts++
      }
      const num2 = Math.floor(Math.random() * (max - min + 1)) + min
      return {
        num1: num2 + Math.floor(Math.random() * (max - num2)) + min,
        num2
      }
    }
  },
  subtraction: {
    calculate: (a, b) => a - b,
    symbol: '-',
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const num2 = Math.floor(Math.random() * (max - min + 1)) + min
        const num1 = num2 + Math.floor(Math.random() * (max - num2)) + min
        if (!isInHistory({ num1, num2 })) {
          return { num1, num2 }
        }
        attempts++
      }
      const num2 = Math.floor(Math.random() * (max - min + 1)) + min
      return {
        num1: num2 + Math.floor(Math.random() * (max - num2)) + min,
        num2
      }
    }
  },
  multiplication: {
    calculate: (a, b) => a * b,
    symbol: '×',
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const num1 = Math.floor(Math.random() * (max - min + 1)) + min
        const num2 = Math.floor(Math.random() * (max - min + 1)) + min
        if (!isInHistory({ num1, num2 })) {
          return { num1, num2 }
        }
        attempts++
      }
      return {
        num1: Math.floor(Math.random() * (max - min + 1)) + min,
        num2: Math.floor(Math.random() * (max - min + 1)) + min
      }
    }
  },
  division: {
    calculate: (a, b) => a / b,
    symbol: '÷',
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const num2 = Math.floor(Math.random() * (max - min + 1)) + min
        const result = Math.floor(Math.random() * (max - min + 1)) + min
        const num1 = num2 * result
        if (!isInHistory({ num1, num2 })) {
          return { num1, num2 }
        }
        attempts++
      }
      const num2 = Math.floor(Math.random() * (max - min + 1)) + min
      const result = Math.floor(Math.random() * (max - min + 1)) + min
      return { num1: num2 * result, num2 }
    }
  },
  decomposition: {
    calculate: (number) => {
      const str = number.toString()
      const length = str.length
      return str.split('').map((digit, index) => ({
        value: parseInt(digit),
        position: length - index - 1
      }))
    },
    generateNumbers: ({ min, max }, isInHistory, maxAttempts = 10) => {
      let attempts = 0
      while (attempts < maxAttempts) {
        const number = Math.floor(Math.random() * (max - min + 1)) + min
        if (!isInHistory(number)) {
          return { number }
        }
        attempts++
      }
      return { number: Math.floor(Math.random() * (max - min + 1)) + min }
    }
  },
  grid: {
    calculate: () => null,
    symbol: '🎯',
    generateGrid: ({ rows, cols, startNumber }) => {
      const grid = []
      for (let i = 0; i < rows; i++) {
        const row = []
        for (let j = 0; j < cols; j++) {
          row.push(startNumber + (i * cols) + j)
        }
        grid.push(row)
      }
      return grid
    }
  }
}

export const sessionSizes = [
  { id: 'small', name: 'Courte', count: 10 },
  { id: 'medium', name: 'Moyenne', count: 20 },
  { id: 'large', name: 'Longue', count: 30 }
]

export const gameCategories = [
  {
    id: 'addition',
    name: 'Additions',
    levels: [
      { id: 'add_easy', name: 'Facile', description: 'Additions de 1 à 10', min: 1, max: 10, timer: 20 },
      { id: 'add_medium', name: 'Moyen', description: 'Additions de 10 à 30', min: 10, max: 30, timer: 15 },
      { id: 'add_hard', name: 'Difficile', description: 'Additions de 20 à 100', min: 20, max: 100, timer: 10 }
    ]
  },
  {
    id: 'columnAddition',
    name: 'Additions posées',
    levels: [
      { id: 'col_add_easy', name: 'Facile', description: 'Additions posées de 10 à 99', min: 10, max: 99, timer: 60 },
      { id: 'col_add_medium', name: 'Moyen', description: 'Additions posées de 100 à 999', min: 100, max: 999, timer: 90 },
      { id: 'col_add_hard', name: 'Difficile', description: 'Additions posées de 1000 à 9999', min: 1000, max: 9999, timer: 120 }
    ]
  },
  {
    id: 'columnSubtraction',
    name: 'Soustractions posées',
    levels: [
      { id: 'col_sub_easy', name: 'Facile', description: 'Soustractions posées de 10 à 99', min: 10, max: 99, timer: 60 },
      { id: 'col_sub_medium', name: 'Moyen', description: 'Soustractions posées de 100 à 999', min: 100, max: 999, timer: 90 },
      { id: 'col_sub_hard', name: 'Difficile', description: 'Soustractions posées de 1000 à 9999', min: 1000, max: 9999, timer: 120 }
    ]
  },
  {
    id: 'subtraction',
    name: 'Soustractions',
    levels: [
      { id: 'sub_easy', name: 'Facile', description: 'Soustractions de 1 à 10', min: 1, max: 10, timer: 20 },
      { id: 'sub_medium', name: 'Moyen', description: 'Soustractions de 10 à 30', min: 10, max: 30, timer: 15 },
      { id: 'sub_hard', name: 'Difficile', description: 'Soustractions de 20 à 100', min: 20, max: 100, timer: 10 }
    ]
  },
  {
    id: 'multiplication',
    name: 'Multiplications',
    levels: [
      { id: 'mult_easy', name: 'Facile', description: 'Tables de 2 à 5', min: 2, max: 5, timer: 20 },
      { id: 'mult_medium', name: 'Moyen', description: 'Tables de 3 à 9', min: 3, max: 9, timer: 15 },
      { id: 'mult_hard', name: 'Difficile', description: 'Tables de 6 à 12', min: 6, max: 12, timer: 10 }
    ]
  },
  {
    id: 'division',
    name: 'Divisions',
    levels: [
      { id: 'div_easy', name: 'Facile', description: 'Divisions de 2 à 5', min: 2, max: 5, timer: 20 },
      { id: 'div_medium', name: 'Moyen', description: 'Divisions de 3 à 9', min: 3, max: 9, timer: 15 },
      { id: 'div_hard', name: 'Difficile', description: 'Divisions de 6 à 12', min: 6, max: 12, timer: 10 }
    ]
  },
  {
    id: 'decomposition',
    name: 'Décomposition',
    levels: [
      { id: 'dec_easy', name: 'Facile', description: 'Nombres de 0 à 99', min: 0, max: 99, timer: 30 },
      { id: 'dec_medium', name: 'Moyen', description: 'Nombres de 100 à 999', min: 100, max: 999, timer: 45 },
      { id: 'dec_hard', name: 'Difficile', description: 'Nombres de 1000 à 9999', min: 1000, max: 9999, timer: 60 }
    ]
  },
  {
    id: 'grid',
    name: 'Grille de nombres',
    levels: [
      { 
        id: 'grid_easy', 
        name: 'Facile', 
        description: 'Grille 3x3, nombres de 1 à 9',
        rows: 3,
        cols: 3,
        startNumber: 1,
        maxAttempts: 5,
        timer: 30
      },
      { 
        id: 'grid_medium', 
        name: 'Moyen', 
        description: 'Grille 4x4, nombres de 1 à 16',
        rows: 4,
        cols: 4,
        startNumber: 1,
        maxAttempts: 7,
        timer: 45
      },
      { 
        id: 'grid_hard', 
        name: 'Difficile', 
        description: 'Grille 10x10, nombres de 1 à 100',
        rows: 10,
        cols: 10,
        startNumber: 1,
        maxAttempts: 1,
        timer: 60
      }
    ]
  }
]