import { afterEach, describe, expect, it, vi } from 'vitest'
import { AiError, chat, friendlyError, listModels } from '../src/services/ai'

const okFetch = (body: unknown) =>
  vi.fn(async (_url: string | URL, _init?: RequestInit) => ({ ok: true, json: async () => body }) as Response)

afterEach(() => vi.unstubAllGlobals())

describe('OpenAI-compatible adapter', () => {
  it('sends system + turns with Bearer auth and returns the reply', async () => {
    const fetchMock = okFetch({ choices: [{ message: { content: 'Hello!' } }] })
    vi.stubGlobal('fetch', fetchMock)
    const out = await chat('openai', {
      system: 'sys prompt',
      turns: [{ role: 'user', content: 'hi' }],
      model: 'gpt-test',
      key: 'sk-test',
    })
    expect(out).toBe('Hello!')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test')
    const body = JSON.parse(String(init.body))
    expect(body.model).toBe('gpt-test')
    expect(body.messages[0]).toMatchObject({ role: 'system', content: 'sys prompt' })
    expect(body.messages[1]).toMatchObject({ role: 'user', content: 'hi' })
  })

  it('attaches images as image_url parts on the turn', async () => {
    const fetchMock = okFetch({ choices: [{ message: { content: 'ok' } }] })
    vi.stubGlobal('fetch', fetchMock)
    await chat('custom', {
      system: 's',
      turns: [{ role: 'user', content: 'what is this?', images: ['data:image/png;base64,AAAA'] }],
      model: 'm',
      key: '',
      baseUrl: 'http://localhost:8080/v1',
    })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(String(init.body))
    expect(url).toBe('http://localhost:8080/v1/chat/completions')
    const parts = body.messages[1].content
    expect(parts[0]).toEqual({ type: 'text', text: 'what is this?' })
    expect(parts[1]).toEqual({ type: 'image_url', image_url: { url: 'data:image/png;base64,AAAA' } })
  })
})

describe('Anthropic adapter', () => {
  it('uses the browser-access header, top-level system and base64 image blocks', async () => {
    const fetchMock = okFetch({ content: [{ type: 'text', text: 'Bonjour' }] })
    vi.stubGlobal('fetch', fetchMock)
    const out = await chat('anthropic', {
      system: 'be nice',
      turns: [
        { role: 'user', content: 'a', images: ['data:image/jpeg;base64,BBBB'] },
        { role: 'assistant', content: 'b' },
        { role: 'assistant', content: 'c' }, // consecutive — must merge
        { role: 'user', content: 'd' },
      ],
      model: 'claude-test',
      key: 'ak-test',
    })
    expect(out).toBe('Bonjour')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    const h = init.headers as Record<string, string>
    expect(h['x-api-key']).toBe('ak-test')
    expect(h['anthropic-dangerous-direct-browser-access']).toBe('true')
    const body = JSON.parse(String(init.body))
    expect(body.system).toBe('be nice')
    expect(body.messages).toHaveLength(3) // merged consecutive assistants
    const first = body.messages[0].content
    expect(first[0]).toMatchObject({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'BBBB' } })
    expect(first[1]).toMatchObject({ type: 'text', text: 'a' })
  })
})

describe('Gemini adapter', () => {
  it('maps roles to user/model and reads candidates', async () => {
    const fetchMock = okFetch({ candidates: [{ content: { parts: [{ text: 'Namaste' }] } }] })
    vi.stubGlobal('fetch', fetchMock)
    const out = await chat('gemini', {
      system: 'sys',
      turns: [
        { role: 'user', content: 'q1' },
        { role: 'assistant', content: 'a1' },
        { role: 'user', content: 'q2' },
      ],
      model: 'gemini-x',
      key: 'gk',
    })
    expect(out).toBe('Namaste')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/v1beta/models/gemini-x:generateContent?key=gk')
    const body = JSON.parse(String(init.body))
    expect(body.systemInstruction.parts[0].text).toBe('sys')
    expect(body.contents.map((c: { role: string }) => c.role)).toEqual(['user', 'model', 'user'])
  })
})

describe('listModels', () => {
  it('parses OpenAI-style lists', async () => {
    const fetchMock = okFetch({ data: [{ id: 'b' }, { id: 'a' }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await listModels('openai', 'k')).toEqual(['a', 'b'])
  })
  it('strips the models/ prefix for Gemini', async () => {
    const fetchMock = okFetch({ models: [{ name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] }, { name: 'models/embed-x', supportedGenerationMethods: ['embedContent'] }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await listModels('gemini', 'k')).toEqual(['gemini-2.5-flash'])
  })
})

describe('friendlyError', () => {
  it('translates HTTP statuses', () => {
    expect(friendlyError(new AiError(401, ''))).toMatch(/Key rejected/)
    expect(friendlyError(new AiError(429, ''))).toMatch(/Rate limited/)
    expect(friendlyError(new AiError(500, ''))).toMatch(/provider is having trouble/i)
  })
  it('explains network/CORS failures and cancellations', () => {
    expect(friendlyError(new TypeError('Failed to fetch'))).toMatch(/gateway is running/)
    expect(friendlyError(new DOMException('abort', 'AbortError'))).toMatch(/Cancelled/)
    expect(friendlyError('boom')).toBe('boom')
  })
})
