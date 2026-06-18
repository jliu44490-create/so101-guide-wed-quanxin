/**
 * POST /api/stripe-webhook
 *
 * Stripe calls this when a checkout completes. We verify the signature, then
 * write an entitlement row using the service-role client (which bypasses RLS —
 * the only way an entitlement can be created, so users can't self-grant).
 *
 * Env (server-only):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   whsec_...  (from the Stripe webhook endpoint config)
 *
 * Stripe dashboard → Developers → Webhooks → add endpoint:
 *   URL:   https://<your-domain>/api/stripe-webhook
 *   Event: checkout.session.completed
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { AI_OVERAGE } from '@/lib/ai-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 })
  }

  // Raw body is required for signature verification — do NOT JSON.parse first.
  const rawBody = await req.text()
  const stripe = new Stripe(secret)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid signature'
    return NextResponse.json({ error: `webhook signature failed: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = (session.metadata?.user_id || session.client_reference_id) ?? null

    if (!userId) {
      // Nothing to grant to — acknowledge so Stripe doesn't retry forever.
      return NextResponse.json({ received: true, warning: 'no user_id in session' })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'admin not configured' }, { status: 503 })
    }

    if (session.metadata?.product === 'ai_credits') {
      // AI overage pack → top up the user's prepaid credit balance.
      const { error } = await admin.rpc('add_ai_credits', {
        p_user: userId,
        p_tokens: AI_OVERAGE.tokens
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // All-access course unlock → grant the entitlement.
      const { error } = await admin.from('entitlements').upsert(
        {
          user_id: userId,
          product: 'all-access',
          source: 'stripe',
          stripe_session_id: session.id
        },
        { onConflict: 'user_id' }
      )
      // Return 500 so Stripe retries — we don't want to lose a paid grant.
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
