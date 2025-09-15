# Playwright LLM Vision (Ollama)

This project demonstrates how to use Playwright tests together with a local/remote Ollama LLM to analyze page screenshots (vision) and verify visual claims. The example test navigates to a real site, captures a screenshot, asks a vision-capable model to describe it, and verifies a textual claim about the image.

Key pieces:
- Playwright config: `./playwright.config.ts`
- Example tests: `src/tests/*`
- Ollama helper: `src/helpers/OllamaHelper.ts`

Note: The helper uses the official ollama Node client.

## Features

- End-to-end browser automation with @playwright/test
- Vision analysis with Ollama via `src/helpers/OllamaHelper.ts`
  - describeImage(image)
  - verifyImage(image, claim)
- Attaches the screenshot and model outputs to the Playwright report

## Prerequisites

- Node.js 18+
- Browsers for Playwright (Chromium, etc.)
- Ollama installed and running (local or remote)
  - See: `src/llm-vision/doc.readme` and `src/helpers/README.md`
- Pulled models (examples):
  - `ollama pull gemma3:latest`

## Install

1) Install dependencies:
   ```bash 
   npm install
   ```

2) Install Playwright browsers:
   ```bash 
   npx playwright install
   ```

3) Ensure Ollama is installed and running:
   - Refer to: src/llm-vision/doc.readme
   - Verify with: ollama --version

## Configure Ollama host

The default Ollama host in src/helpers/OllamaHelper.ts is:
- http://localhost:11434
You can override it via environment variable:
- OLLAMA_HOST=http://127.0.0.1:11434 (or your remote URL)

Examples:
- macOS/Linux: export OLLAMA_HOST=http://127.0.0.1:11434
- Windows (PowerShell): $env:OLLAMA_HOST="http://127.0.0.1:11434"

## Run the tests

- Run all tests:
  
  ```bash 
  npx playwright test
  ```

- Open the HTML report after running:
   
  ```bash
  npx playwright show-report
  ```
## Example

Code:
```js
  const goButtonClaim = 'Is the GO button present on the screen?'
  const goButtonAnalysis = await llmVision.verifyImage(screenshot, goButtonClaim)

  console.log(goButtonClaim, goButtonAnalysis.explanation.trim())
  expect(goButtonAnalysis.matches, goButtonAnalysis.explanation).toBeTruthy()
```

Result:
```
There is a prominent "GO" button displayed at the center of the screen, clearly indicating its presence. — example.spec.ts:29

  28 |   console.log(goButtonClaim, goButtonAnalysis.explanation.trim())
  29 |   expect(goButtonAnalysis.matches, goButtonAnalysis.explanation).toBeTruthy()

```

## Error example

### Note: The speedtest.net logo is a image not text.

Code:
```js
  const logoClaim = 'Is the logo with LatencyTest text present on the top left corner?'
  const logoAnalysis = await llmVision.verifyImage(screenshot, logoClaim)

  console.log(logoClaim, logoAnalysis.explanation.trim())
  expect(logoAnalysis.matches, logoAnalysis.explanation).toBeTruthy()
```

Error:
```bash
[chromium] › src/tests/example.spec.ts:52:5 › Speedtest page logo check
Is the logo with LatencyTest text present on the top left corner?
  1) [chromium] › src/tests/example.spec.ts:52:5 › Speedtest page logo check ───────────────────────

    Error: The image shows the Speedtest logo, but it does not contain the text "LatencyTest" as described in the claim.

    expect(received).toBeTruthy()

    Received: false

      67 |
      68 |   console.log(logoClaim, logoAnalysis.explanation.trim())
    > 69 |   expect(logoAnalysis.matches, logoAnalysis.explanation).toBeTruthy()
         |                                                          ^
      70 | })
        at /Users/nicolae/Projects/playwright-llm-vision/src/tests/example.spec.ts:69:58
```

## Playwright Report Link




## Notes and troubleshooting

- If the test cannot reach Ollama, check OLLAMA_HOST and that the server is running.
- Ensure you pulled a vision-capable model (e.g., gemma3:latest) before running vision features.
- First-time model use may take longer (model loading).
- Playwright runs with headless: false per `./playwright.config.ts`; change if needed.
