export const operations = {
  addition: {
    calculate: (a, b) => a + b,
    symbol: '+',
    generateNumbers: ({ min, max }) => ({
      num1: Math.floor(Math.random() * (max - min + 1)) + min,
      num2: Math.floor(Math.random() * (max - min + 1)) + min
    })
  },
  subtraction: {
    calculate: (a, b) => a - b,
    symbol: '-',
    generateNumbers: ({ min, max }) => {
      const num2 = Math.floor(Math.random() * (max - min + 1)) + min
      const num1 = num2 + Math.floor(Math.random() * (max - num2)) + min
      return { num1, num2 }
    }
  },
  multiplication: {
    calculate: (a, b) => a * b,
    symbol: '×',
    generateNumbers: ({ min, max }) => ({
      num1: Math.floor(Math.random() * (max - min + 1)) + min,
      num2: Math.floor(Math.random() * (max - min + 1)) + min
    })
  },
  division: {
    calculate: (a, b) => a / b,
    symbol: '÷',
    generateNumbers: ({ min, max }) => {
      const num2 = Math.floor(Math.random() * (max - min + 1)) + min // diviseur
      const result = Math.floor(Math.random() * (max - min + 1)) + min // quotient
      const num1 = num2 * result // dividende
      return { num1, num2 }
    }
  }
}

export const gameCategories = [
  {
    id: 'addition',
    name: 'Additions',
    levels: [
      { id: 'add_easy', name: 'Facile', description: 'Additions de 1 à 10', min: 1, max: 10 },
      { id: 'add_medium', name: 'Moyen', description: 'Additions de 10 à 30', min: 10, max: 30 },
      { id: 'add_hard', name: 'Difficile', description: 'Additions de 20 à 100', min: 20, max: 100 }
    ]
  },
  {
    id: 'subtraction',
    name: 'Soustractions',
    levels: [
      { id: 'sub_easy', name: 'Facile', description: 'Soustractions de 1 à 10', min: 1, max: 10 },
      { id: 'sub_medium', name: 'Moyen', description: 'Soustractions de 10 à 30', min: 10, max: 30 },
      { id: 'sub_hard', name: 'Difficile', description: 'Soustractions de 20 à 100', min: 20, max: 100 }
    ]
  },
  {
    id: 'multiplication',
    name: 'Multiplications',
    levels: [
      { id: 'mult_easy', name: 'Facile', description: 'Tables de 2 à 5', min: 2, max: 5 },
      { id: 'mult_medium', name: 'Moyen', description: 'Tables de 3 à 9', min: 3, max: 9 },
      { id: 'mult_hard', name: 'Difficile', description: 'Tables de 6 à 12', min: 6, max: 12 }
    ]
  },
  {
    id: 'division',
    name: 'Divisions',
    levels: [
      { id: 'div_easy', name: 'Facile', description: 'Divisions de 2 à 5', min: 2, max: 5 },
      { id: 'div_medium', name: 'Moyen', description: 'Divisions de 3 à 9', min: 3, max: 9 },
      { id: 'div_hard', name: 'Difficile', description: 'Divisions de 6 à 12', min: 6, max: 12 }
    ]
  }
]