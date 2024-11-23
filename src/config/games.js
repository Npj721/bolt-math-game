export const operations = {
  addition: {
    calculate: (a, b) => a + b,
    symbol: '+',
    generateNumbers: (max) => ({
      num1: Math.floor(Math.random() * max) + 1,
      num2: Math.floor(Math.random() * max) + 1
    })
  },
  subtraction: {
    calculate: (a, b) => a - b,
    symbol: '-',
    generateNumbers: (max) => {
      const num2 = Math.floor(Math.random() * max) + 1
      const num1 = num2 + Math.floor(Math.random() * (max - num2)) + 1
      return { num1, num2 }
    }
  }
}

export const gameCategories = [
  {
    id: 'addition',
    name: 'Additions',
    levels: [
      { id: 'add_easy', name: 'Facile', description: 'Additions jusqu\'à 10', max: 10 },
      { id: 'add_medium', name: 'Moyen', description: 'Additions jusqu\'à 20', max: 20 },
      { id: 'add_hard', name: 'Difficile', description: 'Additions jusqu\'à 100', max: 100 }
    ]
  },
  {
    id: 'subtraction',
    name: 'Soustractions',
    levels: [
      { id: 'sub_easy', name: 'Facile', description: 'Soustractions jusqu\'à 10', max: 10 },
      { id: 'sub_medium', name: 'Moyen', description: 'Soustractions jusqu\'à 20', max: 20 },
      { id: 'sub_hard', name: 'Difficile', description: 'Soustractions jusqu\'à 100', max: 100 }
    ]
  }
]