# Ollama Helper

A small TypeScript helper around the `ollama` Node client. It provides:
- A singleton initializer for the Ollama client
- Text chat convenience via `chatText`
- Vision helpers: `describeImage` and `verifyImage`

Note: For image features you must use a vision-capable model (e.g., `gemma3:latest` or `llava`) already pulled into Ollama.

## Prerequisites

- Node.js 18+ (for built-in fetch and `fs/promises`)
- Ollama installed and running locally or remotely
- Models pulled:
  ```bash
  ollama pull gemma3:latest
  ollama pull gemma3:latest
  # or an alternative vision model, e.g., llava
  ```
- NPM package:
  ```bash
  npm i ollama
  ```

## Installation

Place the helper at `src/ollamaHelper.ts` (or your preferred path):

- Exposes:
  - `getOllamaClient(host?)`
  - `chatText(prompt, opts?)`
  - `describeImage(image, opts?)`
  - `verifyImage(image, claim, opts?)`

The default host is `process.env.OLLAMA_HOST` or `http://127.0.0.1:11434`.

## Quick Start

### Initialize via the helper
```ts
import { getOllamaClient } from './src/helpers/OllamaHelper'

const ollama = getOllamaClient('http://127.0.0.1:11434')
const res = await ollama.chat({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(res.message.content)
```

### Simple text chat
```ts
import { chatText } from './src/helpers/OllamaHelper'

const answer = await chatText('Why is the sky blue?', { model: 'llama3.1' })
console.log(answer)
```

### Describe an image (vision model required)
```ts
import { describeImage } from './src/helpers/OllamaHelper'

// image can be: file path, Buffer, base64 string, or data URL
const description = await describeImage('path/to/photo.jpg', {
  model: 'gemma3:latest',
  // prompt: 'Describe this image in detail.' // optional custom prompt
})
console.log(description)
```

### Verify an image against a claim
```ts
import { verifyImage } from './src/helpers/OllamaHelper'

const verdict = await verifyImage(
  'path/to/photo.jpg',
  'A red car parked on a street',
  { model: 'gemma3:latest' }
)

console.log(verdict.matches)     // true/false
console.log(verdict.explanation) // one-sentence justification
// verdict.raw contains the unparsed model output
```

## API

### getOllamaClient(host?)
- Returns a singleton `Ollama` client.
- Host precedence: explicit `host` arg > `process.env.OLLAMA_HOST` > `http://127.0.0.1:11434`.

### chatText(prompt, opts?)
- `prompt: string`
- `opts?: { model?: string; host?: string }`
- Returns: `Promise<string>` — the assistant’s text reply.
- Default model: `llama3.1`.

### describeImage(image, opts?)
- `image: string | Buffer` (file path, base64, data URL, or Buffer)
- `opts?: { model?: string; host?: string; prompt?: string }`
- Returns: `Promise<string>` — natural-language description.
- Default model: `gemma3:latest`.

### verifyImage(image, claim, opts?)
- `image: string | Buffer`
- `claim: string` — the statement to check against the image.
- `opts?: { model?: string; host?: string }`
- Returns: `Promise<{ matches: boolean; explanation: string; raw: string }>`
- Default model: `gemma3:latest`.
- Behavior: Prompts the model to reply with "Yes"/"No" on the first line and a brief justification on the second line, then parses to a boolean.

## Image Input Formats

`describeImage` and `verifyImage` accept:
- File path (e.g., `'./photo.jpg'`)
- Buffer
- Base64 string (raw)
- Data URL (e.g., `data:image/png;base64,....`)

Internally, inputs are converted to base64 for Ollama.

## Environment Variables

- `OLLAMA_HOST`: Default host for the singleton client.
  - Example: `export OLLAMA_HOST=http://127.0.0.1:11434`

## Troubleshooting

- Model not found:
  - Run `ollama pull <model>` (e.g., `ollama pull gemma3:latest`).
- Connection refused:
  - Ensure Ollama is running and the `host` matches your server address/port.
- Vision-only features:
  - `describeImage` and `verifyImage` require a vision-capable model.
- Invalid data URL:
  - Ensure it includes a comma-separated base64 payload (e.g., `data:image/jpeg;base64,<...>`).

## License

MIT (or your project’s license)