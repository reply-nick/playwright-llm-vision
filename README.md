# Playwright LLM Vision (Ollama)

This project demonstrates how to use Playwright tests together with a local/remote Ollama LLM to analyze page screenshots (vision) and verify visual claims. The example test navigates to a real site, captures a screenshot, asks a vision-capable model to describe it, and verifies a textual claim about the image.

Key pieces:
- Playwright config: `src/playwright.config.ts`
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
  or 
  ```bash
  npm run test
  ```

- Open the HTML report after running:
   
  ```bash
  npx playwright show-report
  ```
  or
  ```bash
  npm run test:report
  ```

## Error Sample
Code:
```js
  const llmVision = new OllamaHelper(process.env.OLLAMA_HOST)
  const textAnalysis = await llmVision.verifyImage(screenshot, 'is the title of the page present, and it is `todos`?')
  expect(textAnalysis.matches, textAnalysis.explanation).toBeTruthy()
```

Error:
```bash
 1) [pixel] › src/tests/example.spec.ts:4:5 › screenshot analysis with OllamaHelper ───────────────

    Error: The image clearly shows the title of the page is "Speedtest Performance Directory."

    expect(received).toBeTruthy()

    Received: false

      26 |   })
    > 27 |   expect(textAnalysis.matches, textAnalysis.explanation).toBeTruthy();
         |                                                          ^
      28 | })
      29 |
      30 |
        at /Users/nicolae/Projects/playwright-llm-vision/src/tests/example.spec.ts:27:58
```


## Notes and troubleshooting

- If the test cannot reach Ollama, check OLLAMA_HOST and that the server is running.
- Ensure you pulled a vision-capable model (e.g., gemma3:latest) before running vision features.
- First-time model use may take longer (model loading).
- Playwright runs with headless: false per `src/playwright.config.ts`; change if needed.
- package.json defines Playwright scripts:

  ```json
  {
  "scripts": {
    "test": "playwright test",
    "test:mobile": "playwright test --project=pixel",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report"
  }
  }
  ```
