// Shared LLM wrapper for the blog pipeline.
// Uses Google Gemini (free tier: 1500 req/day, 1M TPM — plenty of headroom).
//
// Exposes a Groq-like chat interface so existing call sites migrate with
// minimal changes.

import { GoogleGenerativeAI } from '@google/generative-ai'

// gemini-flash-latest: free-tier-accessible, fast, large context.
// (gemini-2.0-flash currently has free_tier_requests limit: 0 — needs billing.)
// If Google renames this, swap here — nowhere else.
const DEFAULT_MODEL = 'gemini-flash-latest'

let _client: GoogleGenerativeAI | null = null
function getClient(): GoogleGenerativeAI {
  if (_client) return _client
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY not set. Get one at https://aistudio.google.com/apikey',
    )
  }
  _client = new GoogleGenerativeAI(apiKey)
  return _client
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompleteOptions {
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  model?: string
  responseFormat?: 'text' | 'json'
}

export interface ChatCompleteResult {
  text: string
  tokensUsed: number
}

// Thrown when the upstream Gemini API is temporarily unavailable (overloaded,
// rate-limited, or 5xx) after all retries are exhausted. Callers can catch
// this to distinguish "try again later" from real bugs.
export class TransientLLMError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'TransientLLMError'
    this.status = status
  }
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])
const RETRY_DELAYS_MS = [5_000, 15_000, 45_000] // 3 attempts after the initial try

function isRetryable(err: unknown): { retry: boolean; status: number } {
  // @google/generative-ai attaches `status` on GoogleGenerativeAIFetchError
  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status: unknown }).status)
      : 0
  return { retry: RETRYABLE_STATUSES.has(status), status }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Gemini uses its own role naming ("user"/"model") and separates the system
// instruction. This wrapper translates the Groq-style message array to
// Gemini's expected shape.
export async function chatComplete(
  opts: ChatCompleteOptions,
): Promise<ChatCompleteResult> {
  const {
    messages,
    maxTokens = 8000,
    temperature = 0.7,
    model = DEFAULT_MODEL,
    responseFormat = 'text',
  } = opts

  const systemMessages = messages.filter(m => m.role === 'system')
  const turnMessages = messages.filter(m => m.role !== 'system')

  const systemInstruction =
    systemMessages.length > 0
      ? systemMessages.map(m => m.content).join('\n\n')
      : undefined

  const generativeModel = getClient().getGenerativeModel({
    model,
    systemInstruction,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
    },
  })

  // Convert to Gemini's history shape. Last user message must be sent via
  // sendMessage, prior turns go into history.
  const history = turnMessages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastMessage = turnMessages[turnMessages.length - 1]
  if (!lastMessage) throw new Error('chatComplete: no user/assistant messages')

  const chat = generativeModel.startChat({ history })

  let lastStatus = 0
  let lastError: unknown = null
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const result = await chat.sendMessage(lastMessage.content)
      const response = result.response
      const text = response.text()

      const usage = response.usageMetadata
      const tokensUsed =
        (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0)

      return { text, tokensUsed }
    } catch (err) {
      const { retry, status } = isRetryable(err)
      lastStatus = status
      lastError = err
      if (!retry || attempt === RETRY_DELAYS_MS.length) break
      const delay = RETRY_DELAYS_MS[attempt]
      console.warn(
        `   ⚠️  Gemini ${status} — retrying in ${delay / 1000}s (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`,
      )
      await sleep(delay)
    }
  }

  if (RETRYABLE_STATUSES.has(lastStatus)) {
    throw new TransientLLMError(
      lastStatus,
      `Gemini upstream unavailable (${lastStatus}) after retries: ${String(lastError)}`,
    )
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}
