# 付费墙配置（Stripe + Supabase）

一次性买断永久解锁。**配置前网站全免费正常运行**（付费墙开关默认关）。配好后打开开关即生效。前提：先完成 `supabase/README.md` 的 Supabase 配置。

---

## 工作原理（先理解再操作）

```
用户在 /unlock 点购买
   → 前端带 Supabase 登录令牌 POST /api/checkout
   → 服务端用令牌确认是谁，创建 Stripe Checkout 会话（把 user_id 塞进 metadata）
   → 跳转 Stripe 托管收银台，用户付款
   → Stripe 回调 POST /api/stripe-webhook
   → 服务端验签 → 用 service_role 写入 entitlements 表（用户自己写不了，这是安全根基）
   → 用户被解锁，前端 useEntitlement 读到记录 → 内容打开
```

前两课永久免费，其余 7 课 + 完整文档 + 社区发帖需解锁。

---

## 第 1 步：建权益表

把更新后的 `supabase/schema.sql`（含末尾的 `entitlements` 表）在 Supabase SQL Editor 里重新跑一遍（可重复执行，安全）。

## 第 2 步：Stripe 建商品 + 价格

1. 注册 / 登录 https://dashboard.stripe.com （需要一个能用 Stripe 的主体：香港/新加坡/美国/日本公司均可，中国大陆主体不行）
2. **Products → Add product**：
   - 名称：`SO101 全部内容 永久解锁`
   - 添加价格 ①：**一次性**，币种 **CNY**，金额 **99** → 保存，复制价格 ID（`price_...`）→ 这是 `STRIPE_PRICE_CNY`
   - 添加价格 ②：**一次性**，币种 **JPY**，金额 **2400** → 复制 ID → `STRIPE_PRICE_JPY`
3. 开启支付方式（Settings → Payment methods）：勾选卡 / Alipay / WeChat Pay（按需）

## 第 3 步：配置 Webhook

1. Stripe → **Developers → Webhooks → Add endpoint**
2. Endpoint URL：`https://<你的域名>/api/stripe-webhook`
3. 监听事件：勾 **`checkout.session.completed`**
4. 创建后复制 **Signing secret**（`whsec_...`）→ 这是 `STRIPE_WEBHOOK_SECRET`

## 第 4 步：拿 Stripe 密钥

Stripe → Developers → **API keys** → 复制 **Secret key**（`sk_live_...` 或测试期 `sk_test_...`）→ 这是 `STRIPE_SECRET_KEY`

## 第 5 步：拿 Supabase Secret key（给 webhook 写权益用）

Supabase → Settings → **API Keys** → **Secret keys** → 复制那个 `sb_secret_...` → 这是 `SUPABASE_SERVICE_ROLE_KEY`
> ⚠️ 这是机密，**只能**放服务端环境变量，绝不能带 `NEXT_PUBLIC_` 前缀。

## 第 6 步：在 Vercel 填环境变量

| Name | Value | 说明 |
|------|-------|------|
| `STRIPE_SECRET_KEY` | `sk_...` | 服务端 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | 服务端 |
| `STRIPE_PRICE_CNY` | `price_...` | ¥99 价格 ID |
| `STRIPE_PRICE_JPY` | `price_...` | ¥2400 价格 ID（可选） |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | 服务端，机密 |
| `NEXT_PUBLIC_PAYWALL_ENABLED` | `true` | **打开付费墙的总开关** |

> ⚠️ `NEXT_PUBLIC_PAYWALL_ENABLED` 一定要**等上面 5 个都填好**再设成 `true`。
> 否则会出现"课程锁了但买不了"的状态。没设或非 `true` 时，全站免费。

填完 **Redeploy**。

## 第 7 步：测试（强烈建议先用测试模式）

1. Stripe 右上角切到 **Test mode**，用测试 key（`sk_test_` / 测试 `price_` / 测试 webhook secret）
2. 测试卡号：`4242 4242 4242 4242`，任意未来日期 + 任意 CVC
3. 流程：登录 → /unlock → 购买 → 测试卡付款 → 跳回 → 第 3-9 课解锁、社区可发帖
4. 验证 Supabase `entitlements` 表里多了你的一行
5. 一切 OK 后切回 **Live mode**，把 Vercel 的 key 换成 live key，重新部署

---

## 调价 / 改免费章节

- **价格**：在 Stripe 改价格（建新 price，更新 env 里的 price ID）。显示用的文案在 `lib/paywall.ts` 的 `PRICING`。
- **哪些课免费**：`lib/paywall.ts` 的 `FREE_CHAPTER_IDS`（默认 `[1, 2]`）。
- **临时全场免费**：把 `NEXT_PUBLIC_PAYWALL_ENABLED` 删掉或设为非 `true`，Redeploy。

## 已知限制（v1）

- **软付费墙**：被锁课程的内容仍会随页面发到浏览器（因为登录在前端）。对 99 元课程这是可接受的取舍；99% 的购买者不会去翻 network 面板。若要硬隔离（内容仅在验证付费后由服务端下发），需要把课程内容移到鉴权 API 后面 —— 列为后续加固项。
- 退款 / 取消权益目前需在 Stripe 退款后，手动在 Supabase 删除该用户的 entitlements 行（或后续加 `charge.refunded` webhook 自动处理）。
