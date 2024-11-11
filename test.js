import fs from 'fs'
import { difference } from 'lodash-es'

const fileData = fs.readFileSync('./combinedData.json', 'utf-8')

const parsedWords = JSON.parse(fileData)

var consumedWords = 0
let usedWords = []

// Helper function to create an empty grid
const createGrid = (sizeRows, sizeCols) =>
  Array.from({ length: sizeRows }, () => Array(sizeCols).fill('-'))

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
    let verticalWord = extractVerticalWord(grid, word, row, col + i, i)

    if (verticalWord && !wordList.includes(verticalWord)) {
      return false // Invalid vertical word formed
    }

    let horizontalWord = extractHorizontalWord(
      grid,
      word,
      row,
      col + i,
      i,
      true
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

    let verticalWord = extractVerticalWord(grid, word, row + i, col, i, true)

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
const extractVerticalWord = (grid, word, row, col, wordIndex, test) => {
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

  if (test) {
    return verticalWord.length > 2 ? verticalWord : null
  }

  // Return a valid word only if it's longer than 1 character
  return verticalWord.length > 1 ? verticalWord : null
}

// Extract potential horizontal word formed at the intersection point when placing vertically
const extractHorizontalWord = (grid, word, row, col, wordIndex, test) => {
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

  if (test) {
    return horizontalWord.length > 2 ? horizontalWord : null
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
  ) {
    return placeHorizontal(grid, word, row, col)
  } else if (
    direction === 'vertical' &&
    canPlaceVertical(grid, word, row, col, wordList, isConnected)
  ) {
    return placeVertical(grid, word, row, col)
  }
  return null
}

// Recursive function to attempt placing a list of words into the grid, alternating between horizontal and vertical
const placeWords = (
  grid,
  words,
  inputDirection = 'horizontal',
  wordList,
  placedWords = 0
) => {
  const freeWords = difference(words, usedWords)

  var word = freeWords[Math.floor(Math.random() * freeWords.length)]
  const isConnected = placedWords > 0 // After the first word, all subsequent words must intersect

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const newGrid = tryPlaceWord(
        grid,
        word,
        i,
        j,
        inputDirection === 'horizontal' ? 'vertical' : 'horizontal',
        wordList,
        isConnected
      )

      if (newGrid) {
        usedWords.push(word)
        consumedWords++

        console.log({ consumedWords })

        return newGrid
      }
    }
  }

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      const newGrid = tryPlaceWord(
        grid,
        word,
        i,
        j,
        inputDirection,
        wordList,
        isConnected
      )

      if (newGrid) {
        usedWords.push(word)
        consumedWords++

        console.log({ consumedWords })

        return newGrid
      }
    }
  }

  return grid
}

// Function to generate the crossword grid
const generateCrossword = (
  gridSizeRows,
  gridSizeCols,
  words,
  numberOfWords
) => {
  let grid = createGrid(gridSizeRows, gridSizeCols)
  const shuffledWords = shuffleArray(words) // Shuffle to randomize the selection
  // return placeWords(grid, shuffledWords, numberOfWords, 'horizontal', words) // Sort words by length

  let direction = 'horizontal'

  while (consumedWords < numberOfWords) {
    grid = placeWords(grid, shuffledWords, direction, words, consumedWords)

    direction = direction === 'horizontal' ? 'vertical' : 'horizontal'
  }

  console.log({ grid })

  return grid
}

// Function to print the grid
const printGrid = grid => {
  if (!grid) {
    console.log('Failed to place all words.')
  } else {
    grid.forEach(row => console.log(row.join(' ')))
  }
}

const numberOfWordsToPlace = 10 // Specify how many words you want to place
printGrid(generateCrossword(10, 10, parsedWords, numberOfWordsToPlace))

// crosswordGrid
