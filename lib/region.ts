/**
 * Region awareness.
 *
 * One codebase, two deployments:
 *   - `global` (default)  → Vercel + Supabase + GitHub/Google OAuth. Current site.
 *   - `cn`                → China-friendly build: domestic backend (Tencent
 *                           CloudBase), email/password only, no Vercel Analytics,
 *                           no Google/GitHub OAuth (blocked / unreliable in CN).
 *
 * Selected at build time via `NEXT_PUBLIC_REGION=cn`. Anything not explicitly
 * "cn" falls back to "global", so existing deploys are unaffected.
 */

export type Region = 'global' | 'cn'

export const REGION: Region = process.env.NEXT_PUBLIC_REGION === 'cn' ? 'cn' : 'global'

export const isCN = REGION === 'cn'

export type OAuthProvider = 'github' | 'google'

/** Social providers to surface in the auth UI for this region. Empty in CN. */
export const oauthProviders: OAuthProvider[] = isCN ? [] : ['github', 'google']

/** Vercel Web Analytics is blocked / pointless behind the GFW. */
export const analyticsEnabled = !isCN

/** Which backend powers auth + community for this region. */
export const backendKind: 'supabase' | 'cloudbase' = isCN ? 'cloudbase' : 'supabase'
