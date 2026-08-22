import OpenAI from 'openai'

/**
 * SERVER-ONLY OpenRouter client (OpenAI-compatible API).
 * Powers the AI Scout interview system with stealth/ox-alpha (free model).
 * Never import from client components — the key must stay server-side.
 */
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const AI_SCOUT_MODEL = 'stealth/ox-alpha'

let _client: OpenAI | null = null

export function getAIClient(): OpenAI | null {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null
  if (!_client) {
    _client = new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': 'https://www.affilliasports.com',
        'X-Title': 'Affillia Sports AI Scout',
      },
    })
  }
  return _client
}
