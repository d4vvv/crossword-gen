import fs from 'fs'

const fileData = fs.readFileSync('./combinedData.json', 'utf-8')

const parsedWords = JSON.parse(fileData)

// Helper function to create an empty grid
const createGrid = size =>
  Array.from({ length: size }, () => Array(size).fill('-'))

// Function to shuffle an array (for random word selection)
const shuffleArray = array => array.sort(() => Math.random() - 0.5)

// Function to check if a word can be placed horizontally in the grid
const canPlaceHorizontal = (grid, word, row, col, wordList, isConnected) => {
  if (col + word.length > grid.length) return false

  let intersects = false

  // Check for collisions and ensure valid words are formed vertically
  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const currentCell = grid[row][col + i]

    if (currentCell !== '-' && currentCell !== char) {
      return false // Collision
    }

    // Check for valid vertical words at the intersection points
    let verticalWord = extractVerticalWord(
      grid,
      word,
      row,
      col + i,
      i,
      'horizontal'
    )
    if (verticalWord && !wordList.includes(verticalWord)) {
      return false // Invalid vertical word formed
    }

    let horizontalWord = extractHorizontalWord(
      grid,
      word,
      row,
      col + i,
      i,
      'horizontal'
    )

    if (horizontalWord && !wordList.includes(horizontalWord)) {
      return false // Invalid horizontal word formed
    }

    // Check if this word intersects with an already placed word
    if (currentCell !== '-') {
      intersects = true
    }
  }

  return isConnected ? intersects : true
}

// Function to check if a word can be placed vertically in the grid
const canPlaceVertical = (grid, word, row, col, wordList, isConnected) => {
  if (row + word.length > grid.length) return false

  let intersects = false

  // Check for collisions and ensure valid words are formed horizontally
  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const currentCell = grid[row + i][col]

    if (currentCell !== '-' && currentCell !== char) {
      return false // Collision
    }

    // Check for valid horizontal words at the intersection points
    let horizontalWord = extractHorizontalWord(grid, word, row + i, col, i)
    if (horizontalWord && !wordList.includes(horizontalWord)) {
      return false // Invalid horizontal word formed
    }

    let verticalWord = extractVerticalWord(grid, word, row + i, col, i)

    if (verticalWord && !wordList.includes(verticalWord)) {
      return false // Invalid vertical word formed
    }

    // Check if this word intersects with an already placed word
    if (currentCell !== '-') {
      intersects = true
    }
  }

  return isConnected ? intersects : true
}

// Function to place a word horizontally in the grid
const placeHorizontal = (grid, word, row, col) =>
  grid.map((r, i) =>
    i === row
      ? r.map((cell, j) =>
          j >= col && j < col + word.length ? word[j - col] : cell
        )
      : r
  )

// Function to place a word vertically in the grid
const placeVertical = (grid, word, row, col) =>
  grid.map((r, i) =>
    i >= row && i < row + word.length
      ? r.map((cell, j) => (j === col ? word[i - row] : cell))
      : r
  )

// Extract potential vertical word formed at the intersection point when placing horizontally
const extractVerticalWord = (grid, word, row, col, wordIndex, direction) => {
  let verticalWord = ''

  // Scan upwards
  for (let i = row - 1; i >= 0 && grid[i][col] !== '-'; i--) {
    verticalWord = grid[i][col] + verticalWord
  }

  // Add the current character of the word being placed
  verticalWord += word[wordIndex]

  // Scan downwards
  for (let i = row + 1; i < grid.length && grid[i][col] !== '-'; i++) {
    verticalWord += grid[i][col]
  }

  // Return a valid word only if it's longer than 1 character
  return verticalWord.length > 1 ? verticalWord : null
}

// Extract potential horizontal word formed at the intersection point when placing vertically
const extractHorizontalWord = (grid, word, row, col, wordIndex, direction) => {
  let horizontalWord = ''

  // Scan leftwards
  for (let j = col - 1; j >= 0 && grid[row][j] !== '-'; j--) {
    horizontalWord = grid[row][j] + horizontalWord
  }

  // Add the current character of the word being placed
  horizontalWord += word[wordIndex]

  // Scan rightwards
  for (let j = col + 1; j < grid[0].length && grid[row][j] !== '-'; j++) {
    horizontalWord += grid[row][j]
  }

  // Return a valid word only if it's longer than 1 character
  return horizontalWord.length > 1 ? horizontalWord : null
}

// Function to try placing a word in either horizontal or vertical direction
const tryPlaceWord = (
  grid,
  word,
  row,
  col,
  direction,
  wordList,
  isConnected
) => {
  if (
    direction === 'horizontal' &&
    canPlaceHorizontal(grid, word, row, col, wordList, isConnected)
    // && canPlaceVertical(grid, word, row, col, wordList, isConnected)
  ) {
    return placeHorizontal(grid, word, row, col)
  } else if (
    direction === 'vertical' &&
    canPlaceVertical(grid, word, row, col, wordList, isConnected)
    // && canPlaceHorizontal(grid, word, row, col, wordList, isConnected)
  ) {
    return placeVertical(grid, word, row, col)
  }
  return null
}

// Recursive function to attempt placing a list of words into the grid, alternating between horizontal and vertical
const placeWords = (
  grid,
  words,
  numberOfWords,
  direction = 'horizontal',
  wordList,
  placedWords = 0,
  maxAttempts = 100
) => {
  if (words.length === 0 || placedWords >= numberOfWords) return grid

  let attempts = 0

  const [word, ...rest] = words
  const isConnected = placedWords > 0 // After the first word, all subsequent words must intersect

  let nextDirection = direction

  printGrid(grid)

  while (attempts < maxAttempts) {
    const row = Math.floor(Math.random() * grid.length)
    const col = Math.floor(Math.random() * grid[0].length)
    nextDirection = Math.round(Math.random()) ? 'horizontal' : 'vertical'

    const newGrid = tryPlaceWord(
      grid,
      word,
      row,
      col,
      nextDirection,
      wordList,
      isConnected
    )

    if (newGrid) {
      const resultGrid = placeWords(
        newGrid,
        rest,
        numberOfWords,
        nextDirection,
        wordList,
        placedWords + 1,
        maxAttempts
      ) // Recursive call
      if (resultGrid) return resultGrid // If all words are placed, return the result
    }
    attempts++
  }

  // If max attempts reached, skip this word and try the next
  return placeWords(grid, rest, numberOfWords, direction, wordList, placedWords)
}

// Function to generate the crossword grid
const generateCrossword = (gridSize, words, numberOfWords) => {
  const grid = createGrid(gridSize)
  const shuffledWords = shuffleArray(words) // Shuffle to randomize the selection
  return placeWords(grid, shuffledWords, numberOfWords, 'horizontal', words) // Sort words by length
}

// Function to print the grid
const printGrid = grid => {
  if (!grid) {
    console.log('Failed to place all words.')
  } else {
    grid.forEach(row => console.log(row.join(' ')))
  }
}

const numberOfWordsToPlace = 5 // Specify how many words you want to place
printGrid(generateCrossword(20, parsedWords, numberOfWordsToPlace))

// crosswordGrid
