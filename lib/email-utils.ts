/**
 * Shared email helpers for the auth pages (login / signup / forgot-password).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

// Common typo fixes for popular email providers.
const EMAIL_DOMAIN_FIXES: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'qq.con': 'qq.com',
  'qq.co': 'qq.com',
  '163.con': '163.com',
  '163.co': '163.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'icloud.con': 'icloud.com',
  'icloud.co': 'icloud.com',
  'foxmial.com': 'foxmail.com'
}

/** Suggest a corrected email when the domain looks like a common typo. */
export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at === -1) return null
  const local = email.slice(0, at).trim()
  const domain = email.slice(at + 1).toLowerCase().trim()
  if (!local || !domain) return null
  const fix = EMAIL_DOMAIN_FIXES[domain]
  if (!fix || fix === domain) return null
  return `${local}@${fix}`
}

export interface PasswordStrength {
  /** 0–4 score. */
  score: number
  label: string
  /** Tailwind class for the meter fill. */
  barClass: string
}

/**
 * Lightweight password strength estimate — length + character classes.
 * Not a security boundary (Supabase enforces its own min length); purely UX.
 */
export function scorePassword(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: '', barClass: 'bg-transparent' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  score = Math.min(score, 4)

  const meta: Record<number, Omit<PasswordStrength, 'score'>> = {
    0: { label: '太短', barClass: 'bg-destructive' },
    1: { label: '弱', barClass: 'bg-destructive' },
    2: { label: '一般', barClass: 'bg-warning' },
    3: { label: '良好', barClass: 'bg-primary' },
    4: { label: '强', barClass: 'bg-success' }
  }
  return { score, ...meta[score] }
}
