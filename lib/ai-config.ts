/**
 * LVJIN AI — model routing, per-tier token budgets, and the assistant persona.
 *
 * Both plans use DeepSeek (an open model) via its OpenAI-compatible API. Plus's
 * perk is full course unlock + a larger daily token quota — not a fancier model.
 *
 * Usage is metered by **tokens per UTC day** (not message count). The /api/ai/chat
 * route checks the running total before answering and adds the real input+output
 * tokens after. Beyond the daily quota, users spend prepaid overage credits.
 */

export type AiTier = 'free' | 'plus'

/** Daily token budget per tier (input + output). Adjust freely. */
export const AI_TOKEN_LIMITS: Record<AiTier, number> = {
  free: 50_000, // ~16 次问答/天
  plus: 300_000 // ~95 次问答/天
}

/**
 * Pay-as-you-go overage. When the daily quota runs out, a user can buy a credit
 * pack: extra tokens that don't expire and are spent only after the daily quota
 * is exhausted. One Stripe price backs it — STRIPE_PRICE_AI_CREDITS.
 */
export const AI_OVERAGE = {
  tokens: 1_000_000, // ~320 次问答
  priceLabel: '¥9.9'
}

export type AiProvider = 'deepseek' | 'anthropic'

/**
 * Which provider/model each tier uses. Plan C: both tiers run the same open
 * model (DeepSeek); Plus differs only by quota + course access. The `provider`
 * union keeps the anthropic path live for when Plus moves to Claude.
 */
export const AI_MODELS: Record<AiTier, { provider: AiProvider; model: string }> = {
  free: { provider: 'deepseek', model: 'deepseek-chat' },
  plus: { provider: 'deepseek', model: 'deepseek-chat' }
}

/** Cap how much of the client-sent history we forward (cost + abuse control). */
export const AI_MAX_HISTORY = 12

/** Max tokens for a single answer. */
export const AI_MAX_OUTPUT_TOKENS = 2048

/** The assistant's persona. RAG context (站内参考资料) is appended per request. */
export const AI_SYSTEM_PROMPT = `你是 **LVJIN AI**，SO-101 / LeKiwi 机械臂「模仿学习」（基于 LeRobot）的中文专家助教。

- 回答准确、简洁、可执行，面向正在学习的同学；用 Markdown 排版，代码放代码块。
- 涉及命令一律用**新版 lerobot CLI**：\`lerobot-train\` / \`lerobot-record\` / \`lerobot-eval\` / \`lerobot-calibrate\` / \`lerobot-teleoperate\` / \`lerobot-find-port\` / \`lerobot-dataset-viz\`。**不要**用旧式 \`python lerobot/scripts/*.py\` 或 \`python -m lerobot.*\`。
- 训练参数用 \`--batch_size\` / \`--steps\` / \`--num_workers\` / \`--optimizer.lr\` / \`--optimizer.grad_clip_norm\`；**不存在** \`--training.*\` 前缀。
- 不确定或超出已知范围时，**明说不确定**，不要编造命令、参数或数字。
- 如果问题与机械臂学习无关，简短礼貌地把话题带回 SO-101 / LeRobot 学习。`
