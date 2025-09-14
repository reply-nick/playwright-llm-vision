import { Ollama } from 'ollama'
import { readFile } from 'node:fs/promises'

type ImageInput = string | Buffer

let singleton: Ollama | null = null
let currentHost: string | null = null

function getDefaultHost() {
  return process.env.OLLAMA_HOST || 'http://localhost:11434'
}

/**
 * Get or create an Ollama client (singleton).
 */
export default class OllamaHelper {
  constructor(host = getDefaultHost()) {
  if (!singleton || currentHost !== host) {
    singleton = new Ollama({ host })
    currentHost = host
  }
}

  getOllamaClient(): Ollama {
      if (!singleton) {
    // Either initialize here:
    // singleton = new Ollama(/* config */);

    // Or throw to force explicit initialization elsewhere:
    throw new Error('Ollama client not initialized. Call initOllamaClient() first.');
  }
  return singleton;
  }

/**
 * Simple text chat helper.
 */
  async chatText(prompt: string, opts?: { model?: string; host?: string }): Promise<string> {
    const client = this.getOllamaClient()
  const model = opts?.model ?? 'gemma3:4b'
  const res = await client.chat({
    model,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.message.content
}

/**
 * Describe an image using a vision-capable model.
 * - image: file path, data URL, base64 string, or Buffer
 */
  async describeImage(
  image: ImageInput,
  opts?: {
    model?: string // e.g. 'gemma3','gemma3:latest' or 'llava'
    host?: string
    prompt?: string
  }
): Promise<string> {
    const client = this.getOllamaClient()
  const model = opts?.model ?? 'gemma3:latest'
  const base64 = await this.imageToBase64(image)
  const userPrompt = opts?.prompt ?? 'Describe this image in detail.'

  const res = await client.chat({
    model,
    messages: [
      {
        role: 'user',
        content: userPrompt,
        // Ollama expects base64 strings for images
        images: [base64],
      },
    ],
  })

  return res.message.content
}

/**
 * Verify whether an image matches a given claim/expectation.
 * Returns a boolean plus a short explanation.
 */
  async verifyImage(
  image: ImageInput,
  claim: string,
  opts?: { model?: string; host?: string }
): Promise<{ matches: boolean; explanation: string; raw: string }> {
    const client = this.getOllamaClient()
  const model = opts?.model ?? 'gemma3:latest'
  const base64 = await this.imageToBase64(image)

  const res = await client.chat({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict visual verifier. Given an image and a claim, respond on the first line with "Yes" or "No" only. On the second line, give a one-sentence justification.',
      },
      {
        role: 'user',
        content: `Claim: ${claim}`,
        images: [base64],
      },
    ],
  })

  const raw = res.message.content?.trim() ?? ''
  const [firstLine, ...rest] = raw.split('\n')
  const matches = firstLine?.toLowerCase().startsWith('yes')
  const explanation = rest.join('\n').trim() || raw

  return { matches, explanation, raw }
}

/**
 * Convert various image inputs into a base64 string (no data URL prefix).
 * - If a Buffer is provided, encode to base64.
 * - If a string:
 *   - If it's a data URL, strip prefix and return the base64 part.
 *   - Try to read as a file path; if that fails, treat it as a raw base64 string.
 */
  async imageToBase64(input: ImageInput): Promise<string> {
  if (Buffer.isBuffer(input)) return input.toString('base64')

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (trimmed.startsWith('data:')) {
      const idx = trimmed.indexOf(',')
      if (idx === -1) throw new Error('Invalid data URL for image')
      return trimmed.slice(idx + 1)
    }
    // Try file path
    try {
      const buf = await readFile(trimmed)
      return buf.toString('base64')
    } catch {
      // Assume already a base64 string
      return trimmed
    }
  }

  throw new Error('Unsupported image input type')
}
}
