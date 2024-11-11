import fs from 'fs'

async function readAndCombineJsonFiles(filePaths) {
  try {
    // Loop over each file path, read and parse the data
    for (const filePath of filePaths) {
      const data = fs.readFileSync(filePath, 'utf-8') // Read file as string

      const jsonData = JSON.parse(data) // Parse JSON data

      const combinedRead = fs.readFileSync('./combinedData2.json', 'utf-8')

      const combinedJsonData = JSON.parse(combinedRead)

      const combinedData = [...combinedJsonData, ...jsonData]

      fs.writeFileSync(
        './combinedData2.json',
        JSON.stringify(combinedData, null, 2),
        { encoding: 'utf-8' },
        err => {
          if (err) {
            throw err
          }
        }
      )

      // Combine data (example: assuming each file contains an array of objects)
    }
    console.log('Combined data saved to combinedData2.json')
  } catch (error) {
    console.error('Error:', error)
  }
}

// Example of file paths to read from
const files = [
  'hasla-3.json',
  'hasla-4.json',
  'hasla-5.json',
  'hasla-6.json',
  'hasla-7.json',
  'hasla-8.json',
  'hasla-9.json',
  'hasla-10.json',
  'hasla-11.json',
  'hasla-12.json',
  'hasla-13.json',
]

readAndCombineJsonFiles(files)
