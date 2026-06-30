/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session and returns its URL. Two products:
 *   - default / 'all-access' → the one-time course unlock (¥99 / ¥2400)
 *   - 'ai_credits'           → a prepaid LVJIN AI overage pack (repeatable)
 *
 * Auth: the client sends its Supabase access token as `Authorization: Bearer`.
 * We verify it, stamp the user id (and product) into the session metadata so the
 * webhook grants the right thing to the right account.
 *
 * Env (all server-only):
 *   STRIPE_SECRET_KEY      sk_live_... / sk_test_...
 *   STRIPE_PRICE_CNY       price_...  (¥99 CNY all-access)
 *   STRIPE_PRICE_JPY       price_...  (¥2400 JPY all-access, optional)
 *   STRIPE_PRICE_AI_CREDITS price_... (the AI overage pack, e.g. ¥9.9)
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return NextResponse.json({ error: '支付尚未配置' }, { status: 503 })

  const admin = getSupabaseAdmin()
  if (!admin) return NextResponse.json({ error: '后端尚未配置' }, { status: 503 })

  // 1. Identify the user.
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: '请先登录' }, { status: 401 })
  const {
    data: { user },
    error: userErr
  } = await admin.auth.getUser(token)
  if (userErr || !user) {
    return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
  }

  // 2. Which product?
  let product = 'all-access'
  let currency = 'cny'
  let localePrefix = '' // '/ja' → return the buyer to the Japanese page after Stripe
  try {
    const body = await req.json()
    if (body?.product === 'ai_credits') product = 'ai_credits'
    if (body?.currency === 'jpy') currency = 'jpy'
    if (body?.locale === 'ja') localePrefix = '/ja'
  } catch {
    // no body → defaults
  }

  const origin =
    req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://lvjin.online'

  let priceId: string | undefined
  let successUrl: string
  let cancelUrl: string

  if (product === 'ai_credits') {
    // Repeatable — no "already owned" check.
    priceId = process.env.STRIPE_PRICE_AI_CREDITS
    if (!priceId) return NextResponse.json({ error: '额外配额暂不可购买' }, { status: 400 })
    successUrl = `${origin}${localePrefix}/ai?topup=success`
    cancelUrl = `${origin}${localePrefix}/ai?topup=cancelled`
  } else {
    // All-access: don't let an already-entitled user pay twice.
    const { data: existing } = await admin
      .from('entitlements')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: '你已经解锁过了', alreadyOwned: true }, { status: 409 })
    }
    priceId = currency === 'jpy' ? process.env.STRIPE_PRICE_JPY : process.env.STRIPE_PRICE_CNY
    if (!priceId) return NextResponse.json({ error: '该币种暂不可用' }, { status: 400 })
    successUrl = `${origin}${localePrefix}/unlock?status=success`
    cancelUrl = `${origin}${localePrefix}/unlock?status=cancelled`
  }

  const stripe = new Stripe(secret)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { user_id: user.id, product },
      customer_email: user.email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : '创建支付会话失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
