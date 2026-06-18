import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { search } from '@/lib/knowledge-base'
import {
  AI_MAX_HISTORY,
  AI_MAX_OUTPUT_TOKENS,
  AI_MODELS,
  AI_SYSTEM_PROMPT,
  AI_TOKEN_LIMITS,
  type AiTier
} from '@/lib/ai-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const utcDay = () => new Date().toISOString().slice(0, 10)

/** Build a short RAG context block from the site knowledge base. */
function ragContext(question: string): string {
  if (!question) return ''
  try {
    const results = (search(question) as unknown[]).slice(0, 4)
    const lines = results
      .map((r) => {
        const item = (r as { item?: Record<string, unknown> }).item ?? (r as Record<string, unknown>)
        const title = (item.title ?? item.name ?? '') as string
        const body = (item.body ?? item.content ?? item.text ?? item.snippet ?? '') as string
        if (!title) return ''
        return `- ${title}：${String(body).replace(/\s+/g, ' ').slice(0, 300)}`
      })
      .filter(Boolean)
    return lines.length ? `\n\n【站内参考资料（优先据此回答，并自然融入）】\n${lines.join('\n')}` : ''
  } catch {
    return ''
  }
}

export async function POST(req: Request) {
  const admin = getSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: '后端未配置' }, { status: 503 })

  // 1. Identify the user.
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: '请先登录' }, { status: 401 })
  const {
    data: { user },
    error: userErr
  } = await admin.auth.getUser(token)
  if (userErr || !user) return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })

  // 2. Tier from entitlement (a paid user has a row).
  const { data: ent } = await admin
    .from('entitlements')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  const tier: AiTier = ent ? 'plus' : 'free'
  const limit = AI_TOKEN_LIMITS[tier]

  // 3. Token quota for today.
  const { data: usageRow } = await admin
    .from('ai_usage')
    .select('tokens_used')
    .eq('user_id', user.id)
    .eq('day', utcDay())
    .maybeSingle()
  const used = Number(usageRow?.tokens_used ?? 0)
  let fromCredit = false
  if (used >= limit) {
    // Daily quota exhausted — fall back to prepaid overage credits.
    const { data: creditRow } = await admin
      .from('ai_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()
    if (Number(creditRow?.balance ?? 0) <= 0) {
      return NextResponse.json({ error: 'quota', tier, used, limit, canBuy: true }, { status: 429 })
    }
    fromCredit = true
  }

  // 4. Parse + sanitize history.
  let body: { messages?: ChatMsg[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求无效' }, { status: 400 })
  }
  const history: ChatMsg[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .slice(-AI_MAX_HISTORY)
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) }))
  while (history.length && history[0].role !== 'user') history.shift()
  if (!history.length) return NextResponse.json({ error: '没有消息内容' }, { status: 400 })

  const lastUser = [...history].reverse().find((m) => m.role === 'user')?.content ?? ''
  const system = AI_SYSTEM_PROMPT + ragContext(lastUser)

  // 5. Call the tier's provider (streaming).
  const { provider, model } = AI_MODELS[tier]
  let upstream: Response
  try {
    if (provider === 'anthropic') {
      const key = process.env.ANTHROPIC_API_KEY
      if (!key) return NextResponse.json({ error: 'AI 暂未配置（缺 Anthropic 密钥）' }, { status: 503 })
      upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model,
          max_tokens: AI_MAX_OUTPUT_TOKENS,
          system,
          stream: true,
          messages: history
        })
      })
    } else {
      const key = process.env.DEEPSEEK_API_KEY
      if (!key) return NextResponse.json({ error: 'AI 暂未配置（缺 DeepSeek 密钥）' }, { status: 503 })
      upstream = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          max_tokens: AI_MAX_OUTPUT_TOKENS,
          stream: true,
          stream_options: { include_usage: true },
          messages: [{ role: 'system', content: system }, ...history]
        })
      })
    }
  } catch {
    return NextResponse.json({ error: '调用模型失败，请稍后重试' }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('[ai] upstream error', upstream.status, detail.slice(0, 500))
    return NextResponse.json({ error: '模型服务返回错误，请稍后重试' }, { status: 502 })
  }

  // 6. Pipe text deltas to the client; tally tokens; record usage at the end.
  const encoder = new TextEncoder()
  let inTok = 0
  let outTok = 0
  let dsTotal = 0

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() ?? ''
          for (const raw of lines) {
            const line = raw.trim()
            if (!line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (!payload || payload === '[DONE]') continue
            let j: Record<string, unknown>
            try {
              j = JSON.parse(payload)
            } catch {
              continue
            }
            if (j.type) {
              // Anthropic SSE
              if (j.type === 'content_block_delta') {
                const d = j.delta as { type?: string; text?: string } | undefined
                if (d?.type === 'text_delta' && d.text) controller.enqueue(encoder.encode(d.text))
              } else if (j.type === 'message_start') {
                inTok = Number((j.message as { usage?: { input_tokens?: number } })?.usage?.input_tokens ?? 0)
              } else if (j.type === 'message_delta') {
                outTok = Number((j.usage as { output_tokens?: number })?.output_tokens ?? outTok)
              }
            } else if (Array.isArray(j.choices)) {
              // DeepSeek / OpenAI-compatible SSE
              const delta = (j.choices[0] as { delta?: { content?: string } })?.delta?.content
              if (delta) controller.enqueue(encoder.encode(delta))
              const u = j.usage as { total_tokens?: number } | undefined
              if (u?.total_tokens) dsTotal = u.total_tokens
            }
          }
        }
      } catch (e) {
        console.error('[ai] stream error', e)
      }
      const totalTokens = dsTotal || inTok + outTok
      if (totalTokens > 0) {
        await admin.rpc('add_ai_usage', { p_user: user.id, p_tokens: totalTokens }).catch(() => {})
        if (fromCredit) {
          await admin.rpc('spend_ai_credits', { p_user: user.id, p_tokens: totalTokens }).catch(() => {})
        }
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-ai-tier': tier,
      'x-ai-model': model
    }
  })
}
