import { Ollama } from 'ollama'
import { readFile } from 'node:fs/promises'

type ImageInput = string | Buffer

let ollama: Ollama | null = null
let currentHost: string | null = null

function getDefaultHost() {
  return process.env.OLLAMA_HOST || 'http://localhost:11434'
}

export default class OllamaHelper {
  constructor(host = getDefaultHost()) {
  if (!ollama || currentHost !== host) {
    ollama = new Ollama({ host })
    currentHost = host
  }
}

  getOllamaClient(): Ollama {
    if (!ollama) {
      throw new Error('Ollama client not initialized. Check config.');
    }
  return ollama;
  }

// Simple text chat helper.
  async chatText(prompt: string, opts?: { model?: string; host?: string; prompt?: string }): Promise<string> {
    const client = this.getOllamaClient()
  const model = opts?.model ?? 'gemma3:latest'
  const userPrompt = 'You are a expert Software Test Engineer assistant. Given a request, respond exactly.'
  const res = await client.chat({
    model,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.message.content
}

// Describe an image using a vision-capable model. Image: file path, data URL, base64 string, or Buffer.
  async describeImage(
  image: ImageInput,
  opts?: {
    model?: string // e.g. 'gemma3:12b','gemma3:latest' or 'llava'
    host?: string
    prompt?: string
  }
): Promise<string> {
    const client = this.getOllamaClient()
  const model = opts?.model ?? 'gemma3:latest'
  const base64 = await this.imageToBase64(image)
  const userPrompt = opts?.prompt ?? `You are a expert Software Test Engineer. Describe shortly this image in detail from the Quality Assurance perspective. 
  Highlight only the problems if present. Limit the response to a list, each item containg at most 10 words. Dont use markdown.`

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

// Verify whether an image matches a given claim/expectation.
// Returns a yes/no plus a short explanation.

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
          `You are a strict visual verifier. Given an image and a claim, respond on the first line with "Yes" or "No" only. 
          On the second line, give a one-sentence justification. If your response is "No" describe why you think the claim is false.`,
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

  async imageToBase64(input: ImageInput): Promise<string> {
  if (Buffer.isBuffer(input)) return input.toString('base64')

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (trimmed.startsWith('data:')) {
      const idx = trimmed.indexOf(',')
      if (idx === -1) throw new Error('Invalid data URL for image')
      return trimmed.slice(idx + 1)
    }
    try {
      const buf = await readFile(trimmed)
      return buf.toString('base64')
    } catch {
      return trimmed
    }
  }

  throw new Error('Unsupported image input type')
}
}
