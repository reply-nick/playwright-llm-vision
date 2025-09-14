import { test, expect } from '@playwright/test'
import OllamaHelper from '../helpers/OllamaHelper'

test('screenshot analysis with OllamaHelper', async ({ page }, testInfo) => {
  await page.goto('https://www.speedtest.net/')
  await page.waitForLoadState('networkidle')
  
  const screenshot = await page.screenshot({ fullPage: true })
  await testInfo.attach('ui-screenshot', { body: screenshot, contentType: 'image/png' })

  // 
  const llmVision = new OllamaHelper(process.env.OLLAMA_HOST)

  const analysis = await llmVision.describeImage(screenshot)
  await testInfo.attach('ollama-analysis', {
    body: analysis.trim(),
    contentType: 'text/plain',
  })
  console.log('ollama-analysis:', analysis.trim())
  expect(analysis.trim().length).toBeGreaterThan(0)

  const textAnalysis = await llmVision.verifyImage(screenshot, 'is the title of the page present, and it is `todos`?')
  await testInfo.attach('ollama-analysis', {
    body: textAnalysis.explanation.trim(),
    contentType: 'text/plain',
  })
  console.log('ollama-text-analysis:', textAnalysis.explanation.trim())
  expect(textAnalysis.matches, textAnalysis.explanation).toBeTruthy();
})

