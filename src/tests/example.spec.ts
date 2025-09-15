import { test, expect } from '@playwright/test'
import OllamaHelper from '../helpers/OllamaHelper'

test('Sanity check with OllamaHelper', async ({ page }, testInfo) => {
  await page.goto('https://www.speedtest.net/')
  await page.waitForLoadState('networkidle')
  
  const screenshot = await page.screenshot({ fullPage: true })
  await testInfo.attach('ui-screenshot', { body: screenshot, contentType: 'image/png' })

  const llmVision = new OllamaHelper(process.env.OLLAMA_HOST)

  const analysis = await llmVision.describeImage(screenshot)
  await testInfo.attach('page-analysis', {
    body: analysis.trim(),
    contentType: 'text/plain',
  })
  console.log('ollama-analysis:', analysis.trim())
  expect(analysis.trim().length).toBeGreaterThan(0)

  const goButtonClaim = 'Is the GO button present on the screen?'
  const goButtonAnalysis = await llmVision.verifyImage(screenshot, goButtonClaim)
  await testInfo.attach(goButtonClaim, {
    body: goButtonAnalysis.explanation.trim(),
    contentType: 'text/plain',
  })

  console.log(goButtonClaim, goButtonAnalysis.explanation.trim())
  expect(goButtonAnalysis.matches, goButtonAnalysis.explanation).toBeTruthy()

  const resultLinkClaim = 'Is the Results link present on the screen, and does it have a chackmark icon?'
  const resultLinkAnalysis = await llmVision.verifyImage(screenshot, resultLinkClaim)
  await testInfo.attach(resultLinkClaim, {
    body: resultLinkAnalysis.explanation.trim(),
    contentType: 'text/plain',
  })

  console.log(resultLinkClaim, resultLinkAnalysis.explanation.trim())
  expect(resultLinkAnalysis.matches, resultLinkAnalysis.explanation).toBeTruthy()

  const connectionClaim = 'Is the `Multi` selected under Connections?'
  const conectionsCheck = await llmVision.verifyImage(screenshot, connectionClaim)
  await testInfo.attach(connectionClaim, {
    body: conectionsCheck.explanation.trim(),
    contentType: 'text/plain',
  })

  console.log(connectionClaim, conectionsCheck.explanation.trim())
  expect(conectionsCheck.matches, conectionsCheck.explanation).toBeTruthy()
}),

test('Speedtest page logo check', async ({ page }, testInfo) => {
  await page.goto('https://www.speedtest.net/')
  await page.waitForLoadState('networkidle')
  
  const screenshot = await page.screenshot({ fullPage: true })
  await testInfo.attach('ui-screenshot', { body: screenshot, contentType: 'image/png' })

  const llmVision = new OllamaHelper(process.env.OLLAMA_HOST)

  const logoClaim = 'Is the logo with LatencyTest text present on the top left corner?'
  const logoAnalysis = await llmVision.verifyImage(screenshot, logoClaim)
  await testInfo.attach(logoClaim, {
    body: logoAnalysis.explanation.trim(),
    contentType: 'text/plain',
  })

  console.log(logoClaim, logoAnalysis.explanation.trim())
  expect(logoAnalysis.matches, logoAnalysis.explanation).toBeTruthy()
})