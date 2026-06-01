/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the one-time all-access purchase and
 * returns its URL. The caller (the /unlock page) then redirects the browser to
 * Stripe's hosted checkout.
 *
 * Auth: the client sends its Supabase access token as `Authorization: Bearer`.
 * We verify it server-side with the admin client to learn the real user id,
 * and stamp that id into the session metadata so the webhook can grant the
 * entitlement to the right account.
 *
 * Env (all server-only):
 *   STRIPE_SECRET_KEY      sk_live_... / sk_test_...
 *   STRIPE_PRICE_CNY       price_...  (the ¥99 CNY one-time price)
 *   STRIPE_PRICE_JPY       price_...  (the ¥2400 JPY price, optional)
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return NextResponse.json({ error: '支付尚未配置' }, { status: 503 })
  }

  const admin = getSupabaseAdmin()
  if (!admin) {
    return NextResponse.json({ error: '后端尚未配置' }, { status: 503 })
  }

  // 1. Identify the user from their Supabase JWT.
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }
  const {
    data: { user },
    error: userErr
  } = await admin.auth.getUser(token)
  if (userErr || !user) {
    return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
  }

  // 2. Already entitled? Don't let them pay twice.
  const { data: existing } = await admin
    .from('entitlements')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: '你已经解锁过了', alreadyOwned: true }, { status: 409 })
  }

  // 3. Pick the price by requested currency.
  let currency = 'cny'
  try {
    const body = await req.json()
    if (body?.currency === 'jpy') currency = 'jpy'
  } catch {
    // no body → default cny
  }
  const priceId =
    currency === 'jpy' ? process.env.STRIPE_PRICE_JPY : process.env.STRIPE_PRICE_CNY
  if (!priceId) {
    return NextResponse.json({ error: '该币种暂不可用' }, { status: 400 })
  }

  // 4. Create the checkout session.
  const origin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://so101-guide-web-seven.vercel.app'

  const stripe = new Stripe(secret)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      // Bind the purchase to the account so the webhook grants the right user.
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      customer_email: user.email ?? undefined,
      success_url: `${origin}/unlock?status=success`,
      cancel_url: `${origin}/unlock?status=cancelled`,
      allow_promotion_codes: true
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : '创建支付会话失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
