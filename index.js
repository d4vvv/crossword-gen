import puppeteer from 'puppeteer'
import fs from 'fs'

const url = 'http://krzyzowkowo.pl/wyszukiwarka'

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

const main = async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url)

  page.waitForSelector('.fc-cta-consent')
  await page.click('.fc-cta-consent')
  page.waitForSelector('#wzorzec')
  await page.type('#wzorzec', '.............')

  page.waitForSelector('input[type="submit"]')
  await page.click('input[type="submit"]')

  await delay(2000)

  // Evaluate and extract the required data
  const fontData = await page.evaluate(() => {
    // Helper function to get the next sibling elements
    const getNextLiElements = startElement => {
      let element = startElement.nextElementSibling // Start from the next sibling of <br>
      const liContents = []

      // Loop through until you find the second <br> after <li> elements
      let brCount = 0
      while (element && brCount < 2) {
        if (element.tagName.toLowerCase() === 'li') {
          liContents.push(element.textContent.trim()) // Collect <li> contents
        } else if (element.tagName.toLowerCase() === 'br') {
          brCount += 1 // Count the <br> tags
        }
        element = element.nextElementSibling // Move to the next sibling
      }

      return liContents
    }

    const fonts = document.querySelectorAll('ul font')
    const result = []

    fonts.forEach(font => {
      const key = font.textContent.trim().toUpperCase() // Extract <font> content
      const brAfterFont = font.nextElementSibling // First <br> after <font>

      if (brAfterFont && brAfterFont.tagName.toLowerCase() === 'br') {
        // Collect <li> elements between the <br> tags
        const clues = getNextLiElements(brAfterFont)
        result.push({ key, clues })
      }
    })

    return result
  })

  console.log(fontData)

  const jsonData = JSON.stringify(fontData, null, 2)

  // Save the data to a file (in the current directory as data.json)
  fs.writeFileSync('hasla-13.json', jsonData, 'utf-8')

  console.log('Data saved to data.json')

  await page.screenshot({ path: 'screenshot.png' }) // fullPage captures the entire page
  await browser.close()
}

main()
