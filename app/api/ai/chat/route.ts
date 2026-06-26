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
import {
  buildSetupScript,
  buildRecordCommand,
  buildTrainCommand,
  buildEvalCommand,
  diagnoseError,
  type OS,
  type GPU,
  type Installer
} from '@/lib/scaffold'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const utcDay = () => new Date().toISOString().slice(0, 10)

/**
 * 智能脚手架工具 — given to DeepSeek via function calling (gated behind
 * AI_TOOLS_ENABLED). The model only picks parameters; these deterministic
 * generators (lib/scaffold) produce the actual artifact so it's never made up.
 */
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'generate_setup_script',
      description:
        '当用户需要安装/搭建 LeRobot 运行环境(装不上、不会装、从零开始)时调用。根据其操作系统、显卡、环境管理器,生成可直接复制运行的安装脚本。',
      parameters: {
        type: 'object',
        properties: {
          os: { type: 'string', enum: ['windows', 'macos', 'linux'], description: '用户操作系统' },
          gpu: { type: 'string', enum: ['nvidia', 'apple', 'none'], description: '显卡类型,不确定填 none' },
          installer: { type: 'string', enum: ['conda', 'venv'], description: '环境管理器,默认 conda' }
        },
        required: ['os', 'gpu']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'build_lerobot_command',
      description: '当用户需要数据采集/训练/评估的 lerobot 命令时调用,生成参数正确的命令。',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['record', 'train', 'eval'] },
          repo_id: { type: 'string', description: '数据集 repo_id,如 you/pick-place' },
          num_episodes: { type: 'number' },
          fps: { type: 'number' },
          batch_size: { type: 'number' },
          steps: { type: 'number' }
        },
        required: ['action']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'diagnose_error',
      description: '当用户粘贴报错信息求助时调用,从站内错误库匹配根因与解决方案。',
      parameters: {
        type: 'object',
        properties: { error_text: { type: 'string', description: '完整报错文本' } },
        required: ['error_text']
      }
    }
  }
]

interface ToolCall {
  id: string
  name: string
  args: string
}

/** Execute a tool call → a string fed back to the model as the tool result. */
function runTool(name: string, rawArgs: string): string {
  let a: Record<string, unknown> = {}
  try {
    a = JSON.parse(rawArgs || '{}')
  } catch {
    /* malformed args — fall through to defaults */
  }
  try {
    if (name === 'generate_setup_script') {
      const plan = buildSetupScript({
        os: (a.os as OS) ?? 'linux',
        gpu: (a.gpu as GPU) ?? 'none',
        installer: (a.installer as Installer) ?? 'conda'
      })
      return `[安装脚本已生成] 把下面这段脚本**原样**放进 \`\`\`bash 代码块展示给用户(不要改动任何命令),再用简短中文逐步说明每步在做什么。\n\n${plan.script}\n\n【针对该硬件的注意事项,自然融入说明】\n${plan.notes.map((n) => '- ' + n).join('\n')}`
    }
    if (name === 'build_lerobot_command') {
      const action = a.action as string
      let cmd = ''
      if (action === 'record')
        cmd = buildRecordCommand({ repoId: a.repo_id as string, numEpisodes: a.num_episodes as number, fps: a.fps as number })
      else if (action === 'train')
        cmd = buildTrainCommand({ repoId: a.repo_id as string, batchSize: a.batch_size as number, steps: a.steps as number })
      else if (action === 'eval') cmd = buildEvalCommand({ fps: a.fps as number })
      else return '未知的命令类型。'
      return `[命令已生成] 把下面命令**原样**放进代码块展示(不要改动),并简述用途与关键参数:\n\n${cmd}`
    }
    if (name === 'diagnose_error') {
      const hits = diagnoseError(String(a.error_text ?? ''))
      if (!hits.length)
        return '[未匹配] 站内错误库没有命中。请基于通用经验帮用户排查,并建议补充上下文或去 /diagnose 页面。'
      return hits
        .map(
          (h) =>
            `错误:${h.result.error}\n原因:${h.result.cause}\n解决:${h.result.solution}${h.result.command ? '\n推荐命令:' + h.result.command : ''}\n下一步:${h.result.nextStep}`
        )
        .join('\n\n---\n\n')
    }
  } catch (e) {
    console.error('[ai] tool exec failed', name, e)
  }
  return '工具执行失败,请基于已有知识直接回答用户。'
}

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
  // Off by default → behaviour is byte-identical to the no-tools path until the
  // operator deliberately enables it (and can disable instantly).
  const toolsEnabled =
    provider === 'deepseek' &&
    (process.env.AI_TOOLS_ENABLED === '1' || process.env.AI_TOOLS_ENABLED === 'true')

  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const callDeepSeek = (msgs: unknown[], withTools: boolean) =>
    fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${deepseekKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        max_tokens: AI_MAX_OUTPUT_TOKENS,
        stream: true,
        stream_options: { include_usage: true },
        messages: msgs,
        ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {})
      })
    })

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
      if (!deepseekKey) return NextResponse.json({ error: 'AI 暂未配置（缺 DeepSeek 密钥）' }, { status: 503 })
      upstream = await callDeepSeek([{ role: 'system', content: system }, ...history], toolsEnabled)
    }
  } catch {
    return NextResponse.json({ error: '调用模型失败，请稍后重试' }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    console.error('[ai] upstream error', upstream.status, detail.slice(0, 500))
    return NextResponse.json({ error: '模型服务返回错误，请稍后重试' }, { status: 502 })
  }

  // Reserve a conservative amount up-front so a burst of concurrent requests
  // can't all slip past the quota check during the (multi-second) stream. The
  // pre-check + this reservation happen back-to-back, shrinking the race window
  // from "the whole stream" to "one RPC". Reconciled to the true token count
  // when the stream finishes (the delta may be negative — add_ai_usage just adds
  // it, refunding the over-reservation).
  const RESERVE = AI_MAX_OUTPUT_TOKENS
  let reserved = 0
  try {
    await admin.rpc('add_ai_usage', { p_user: user.id, p_tokens: RESERVE })
    reserved = RESERVE
  } catch (e) {
    console.error('[ai] usage reserve failed', e)
  }

  // 6. Pipe text deltas to the client; tally tokens; (optionally) run one tool
  //    round; record usage at the end.
  const encoder = new TextEncoder()
  let inTok = 0
  let outTok = 0
  let dsTotal = 0

  /** Parse one upstream SSE response: stream content out, accumulate tool calls + usage. */
  async function pump(
    resp: Response,
    controller: ReadableStreamDefaultController<Uint8Array>,
    collectTools: boolean
  ): Promise<{ contentStreamed: boolean; toolCalls: ToolCall[] }> {
    const reader = resp.body!.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let contentStreamed = false
    const tools: Record<number, ToolCall> = {}
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
              if (d?.type === 'text_delta' && d.text) {
                controller.enqueue(encoder.encode(d.text))
                contentStreamed = true
              }
            } else if (j.type === 'message_start') {
              inTok = Number((j.message as { usage?: { input_tokens?: number } })?.usage?.input_tokens ?? 0)
            } else if (j.type === 'message_delta') {
              outTok = Number((j.usage as { output_tokens?: number })?.output_tokens ?? outTok)
            }
          } else if (Array.isArray(j.choices)) {
            // DeepSeek / OpenAI-compatible SSE
            const choice = j.choices[0] as {
              delta?: { content?: string; tool_calls?: Array<Record<string, unknown>> }
            }
            const delta = choice?.delta
            if (delta?.content) {
              controller.enqueue(encoder.encode(delta.content))
              contentStreamed = true
            }
            if (collectTools && Array.isArray(delta?.tool_calls)) {
              for (const tc of delta.tool_calls) {
                const idx = Number(tc.index ?? 0)
                if (!tools[idx]) tools[idx] = { id: `call_${idx}`, name: '', args: '' }
                if (tc.id) tools[idx].id = String(tc.id)
                const fn = tc.function as { name?: string; arguments?: string } | undefined
                if (fn?.name) tools[idx].name += fn.name
                if (fn?.arguments) tools[idx].args += fn.arguments
              }
            }
            const u = j.usage as { total_tokens?: number } | undefined
            if (u?.total_tokens) dsTotal += u.total_tokens
          }
        }
      }
    } catch (e) {
      console.error('[ai] pump error', e)
    }
    return { contentStreamed, toolCalls: Object.values(tools) }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (provider === 'anthropic') {
          await pump(upstream, controller, false)
        } else {
          const r1 = await pump(upstream, controller, toolsEnabled)
          // One tool round: model asked for tools and hasn't answered yet.
          if (toolsEnabled && r1.toolCalls.length && !r1.contentStreamed) {
            const assistantMsg = {
              role: 'assistant',
              content: null,
              tool_calls: r1.toolCalls.map((tc) => ({
                id: tc.id,
                type: 'function',
                function: { name: tc.name, arguments: tc.args }
              }))
            }
            const toolMsgs = r1.toolCalls.map((tc) => ({
              role: 'tool',
              tool_call_id: tc.id,
              content: runTool(tc.name, tc.args)
            }))
            let up2: Response | null = null
            try {
              up2 = await callDeepSeek(
                [{ role: 'system', content: system }, ...history, assistantMsg, ...toolMsgs],
                false
              )
            } catch {
              up2 = null
            }
            if (up2 && up2.ok && up2.body) {
              const r2 = await pump(up2, controller, false)
              // Final safety net: if the model said nothing, surface the artifact.
              if (!r2.contentStreamed) {
                for (const tc of r1.toolCalls) controller.enqueue(encoder.encode('\n' + runTool(tc.name, tc.args)))
              }
            } else {
              // Degrade gracefully — emit the deterministic tool output directly.
              for (const tc of r1.toolCalls) controller.enqueue(encoder.encode(runTool(tc.name, tc.args)))
            }
          }
        }
      } catch (e) {
        console.error('[ai] stream error', e)
      }
      const totalTokens = dsTotal || inTok + outTok
      // Reconcile the up-front reservation to the actual usage. delta can be
      // negative (the response was smaller than reserved) — add_ai_usage adds it,
      // refunding the difference. Best-effort: a logging failure must never break
      // the answer the user already received.
      const delta = totalTokens - reserved
      try {
        if (delta !== 0) {
          await admin.rpc('add_ai_usage', { p_user: user.id, p_tokens: delta })
        }
        if (fromCredit && totalTokens > 0) {
          await admin.rpc('spend_ai_credits', { p_user: user.id, p_tokens: totalTokens })
        }
      } catch (e) {
        console.error('[ai] usage accounting failed', e)
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
