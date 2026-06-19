# LVJIN AI 配置（站内 AI 助手）

站内 AI 助手「LVJIN AI」。**Free 和 Plus 都用同一个开源模型（DeepSeek）**——Plus 的差异是**课程全解锁 + 更高的每日配额**（不是更强的模型）。**按 token 计量**；当日配额用尽后，用户可**按量购买额外配额包**继续用。

页面：`/ai`（已进导航「LVJIN AI」）。后端：`app/api/ai/chat`。配置：`lib/ai-config.ts`。

## 已有能力（v2）

**对话（全员 Free + Plus）**
- **多会话历史**：每段对话存进 Supabase（`ai_conversations` / `ai_messages`，RLS 保护，只看得到自己的），左侧栏可回看、切换、删除。
- **新对话** 一键开新；**打开即自我介绍 + 互动选项**：空对话显示 LVJIN AI 的问候与分组「潜在问题」芯片，点一下即开问。
- 界面重做为科幻风（发光 AI 球、玻璃面板、二进制底纹）。

**电子学习伴侣（仅 Plus，需自行开启）**
- 全站浮动 AI 伙伴：互动课**答对发祝贺**（无 token 消耗）、**答错在旁讲解**（点「讲讲」才花 token）、文档页「让 LVJIN 讲讲本章」生动讲解。
- Plus 用户首次弹**说明弹窗**自行决定；也可在「账号设置 → 电子学习伴侣」随时开关。`profiles.companion_enabled` 控制，默认关。
- 讲解走同一条 `/api/ai/chat`，**消耗用户当日 AI 配额**。
- 文件：`learning-companion.tsx` / `companion-bus.ts` / `companion-intro-dialog.tsx` / `companion-explain-button.tsx`。

> ⚠️ 伴侣「仅 Plus」靠 `useEntitlement().hasAccess` 判定，**依赖 `NEXT_PUBLIC_PAYWALL_ENABLED=true`**。付费墙没开时所有登录用户都被当成 Plus（即都能用伴侣）。

## 配额与定价（在 `lib/ai-config.ts` 改）

| | 每日含量 | ≈问答次数 | 模型 |
|---|---|---|---|
| Free | 50,000 token | ~16 次 | deepseek-chat |
| Plus（+课程全解锁） | 300,000 token | ~95 次 | deepseek-chat |

**额外配额包**：`¥9.9 = 100 万 token`（约 320 次，永久不过期），当日含量用尽后自动从中扣。成本约 ¥3.1/包，留约 3 倍毛利。

## 工作原理

```
/ai 发消息（带登录令牌）→ POST /api/ai/chat
  → 确认用户 → 查 entitlements（有=Plus / 无=Free）
  → 读 ai_usage 今日 token：
      未超当日含量 → 正常答
      已超 → 查 ai_credits 余额：有则继续（事后扣余额），无则 429 提示购买
  → search() 检索站内内容做 RAG → DeepSeek 流式返回
  → 结束后 add_ai_usage 累加；若走的积分则 spend_ai_credits 扣减
购买额外配额：/ai 弹「额外配额 ¥9.9」→ /api/checkout (product:ai_credits)
  → Stripe 收银台 → webhook 验签 → add_ai_credits 充值
```

---

## 第 1 步：建表（Supabase SQL Editor）
把 `supabase/schema.sql` 的 **第 11–14 节** 一起跑一遍（可重复执行，安全）：
- §11 `ai_usage` + §12 `ai_credits`（计量与积分，含三个函数）；
- **§13 `ai_conversations` / `ai_messages`**（多会话历史，新）；
- **§14 给 `profiles` 加 `companion_enabled` 列**（电子学习伴侣开关，新）。

> 没跑 §13/§14 的话：历史不会保存（页面不报错，只是空）、设置里的伴侣开关会保存失败。

## 第 2 步：Stripe 建「额外配额包」价格
Stripe（Live）→ Products → 新建产品 `LVJIN AI 额外配额包`：
- 价格：**一次性 One-time**，货币 **CNY**，金额 **9.9** → 复制 price ID（`price_...`）→ 这是 `STRIPE_PRICE_AI_CREDITS`

## 第 3 步：Vercel 环境变量（Production）

| Name | Value | 说明 |
|------|-------|------|
| `DEEPSEEK_API_KEY` | `sk-...` | 唯一要新拿的模型密钥 |
| `STRIPE_PRICE_AI_CREDITS` | `price_...` | ¥9.9 额外配额包价格 ID |

> 其余 `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `SUPABASE_SERVICE_ROLE_KEY` 接付费墙时已配，**复用**。
> **不再需要 `ANTHROPIC_API_KEY`**（Plus 已改用 DeepSeek）。
> webhook 已支持积分包，无需改 Stripe webhook 配置。

填完 **Redeploy**。

## 第 4 步：测试
登录 → `/ai` 提问 → 应流式回答，每条下方显示「由 deepseek-chat 回答」。
- 连发到超过当日含量 → 弹「额外配额 ¥9.9」按钮 → 走 Stripe 测试卡 `4242...` → 回来后 `ai_credits` 表余额 +100 万，可继续问。
- Supabase `ai_usage` 看每日 token 累计，`ai_credits` 看余额。

---

## 调参（`lib/ai-config.ts`）
- `AI_TOKEN_LIMITS`：每档每日含量（Free 50k / Plus 300k）。
- `AI_OVERAGE`：额外配额包大小与价格文案（100 万 token / ¥9.9）。**改价格要同时在 Stripe 改那个 price 并更新 env。**
- `AI_MODELS`：每档模型（现都是 deepseek-chat；将来想给 Plus 上 Claude，把 plus 改成 `{ provider:'anthropic', model:'claude-sonnet-4-6' }` 并配 `ANTHROPIC_API_KEY` 即可，路由已支持）。
- `AI_MAX_OUTPUT_TOKENS`（单条最大 2048）、`AI_SYSTEM_PROMPT`（人设）。

## 已知限制（v1）
- 配额按 **UTC 天** 统计。
- 额度检查在答复前；最后一条可能略微超出（事后才知输出 token）——可接受。
- 积分扣减以请求开始时是否已超日配额来判定来源，跨界那一条记在日配额上——影响极小。
- 旧关键词助手仍在 `/assistant`（已不在导航）。
