'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  ShieldAlert
} from 'lucide-react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { OAuthButtons } from '@/components/oauth-buttons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/use-auth'
import { isValidEmail, scorePassword, suggestEmailFix } from '@/lib/email-utils'
import { oauthProviders } from '@/lib/region'
import { cn } from '@/lib/utils'

function SignupContent() {
  const router = useRouter()
  const search = useSearchParams()
  const { enabled, ready, isLoggedIn, confirmationMethod, signUp, verifyOtp, resendOtp } =
    useAuth()

  const next = search.get('next') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  // OTP confirmation (CloudBase / CN region).
  const [otpCode, setOtpCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (ready && isLoggedIn) router.replace(next)
  }, [ready, isLoggedIn, next, router])

  useEffect(() => {
    if (resendIn <= 0) return
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000)
    return () => window.clearTimeout(id)
  }, [resendIn])

  const trimmed = email.trim()
  const validEmail = isValidEmail(trimmed)
  const validPassword = password.length >= 6
  const matches = confirm.length > 0 && confirm === password
  const strength = scorePassword(password)
  const suggestion = suggestEmailFix(trimmed)

  const emailError = touched && trimmed.length > 0 && !validEmail
  const passwordError = touched && password.length > 0 && !validPassword
  const confirmError = touched && confirm.length > 0 && !matches

  const canSubmit = validEmail && validPassword && matches && agree

  const handleSignup = async () => {
    setTouched(true)
    if (!validEmail) return toast.error('请输入有效邮箱')
    if (!validPassword) return toast.error('密码至少 6 位')
    if (!matches) return toast.error('两次输入的密码不一致')
    if (!agree) return toast.error('请先同意服务条款与隐私政策')

    setSubmitting(true)
    const { error, needsConfirmation } = await signUp(trimmed, password)
    setSubmitting(false)
    if (error) {
      toast.error(
        error.includes('already registered') || error.includes('already been registered')
          ? '该邮箱已注册,请直接登录'
          : error
      )
      return
    }
    if (needsConfirmation) {
      setSentTo(trimmed)
      if (confirmationMethod === 'otp') setResendIn(45)
    } else {
      toast.success('注册成功')
      router.replace(next)
    }
  }

  const handleVerifyOtp = async () => {
    if (!sentTo || otpCode.length < 6) {
      toast.error('请输入完整的 6 位验证码')
      return
    }
    setVerifying(true)
    const { error } = await verifyOtp(sentTo, otpCode)
    setVerifying(false)
    if (error) {
      toast.error(error === 'not_supported' ? '当前后端不支持验证码' : '验证码不正确或已过期')
      return
    }
    toast.success('注册成功')
    router.replace(next)
  }

  const handleResendOtp = async () => {
    if (!sentTo || resendIn > 0) return
    const { error } = await resendOtp(sentTo)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('验证码已重新发送')
    setResendIn(45)
  }

  const backToForm = () => {
    setSentTo(null)
    setOtpCode('')
    setPassword('')
    setConfirm('')
    setResendIn(0)
  }

  const loginHref = `/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`

  // Backend not configured → friendly placeholder.
  if (!enabled) {
    return (
      <AuthShell eyebrow="CREATE ACCOUNT" brandTitle="创建你的 LVJIN 账号">
        <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-400" />
            <h2 className="text-lg font-semibold">社区暂未开放</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            注册服务还没接通(<code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_*</code>{' '}
            未配置)。教程内容仍可正常访问。
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  // Post-signup: confirmation required.
  if (sentTo) {
    // CloudBase (CN) confirms with a one-time code.
    if (confirmationMethod === 'otp') {
      return (
        <AuthShell eyebrow="CREATE ACCOUNT" brandTitle="创建你的 LVJIN 账号">
          <div className="space-y-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <KeyRound className="size-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">输入验证码</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                我们向 <strong className="break-all text-foreground">{sentTo}</strong> 发送了一封
                6 位验证码邮件,输入它即可完成注册。
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleVerifyOtp}
                autoFocus
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="size-11 text-base" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={verifying || otpCode.length < 6}
              className="glow-primary-hover h-11 w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 disabled:opacity-60"
            >
              {verifying ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  验证中…
                </>
              ) : (
                <>
                  验证并登录
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-4 py-3 text-xs">
              <span className="text-muted-foreground">
                {resendIn > 0 ? `${resendIn} 秒后可重发` : '没收到?检查垃圾邮件或重新发送'}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendIn > 0}
                className="shrink-0 font-medium text-foreground underline underline-offset-4 hover:text-primary disabled:opacity-50 disabled:no-underline"
              >
                重新发送
              </button>
            </div>

            <button
              type="button"
              onClick={backToForm}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              ← 换个邮箱重试
            </button>
          </div>
        </AuthShell>
      )
    }

    // Supabase (global) confirms with a clickable email link.
    return (
      <AuthShell eyebrow="CREATE ACCOUNT" brandTitle="创建你的 LVJIN 账号">
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <MailCheck className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">验证你的邮箱</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              确认链接已发往 <strong className="break-all text-foreground">{sentTo}</strong>
              。点击邮件中的链接即可激活账号并登录。
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            没收到?检查垃圾邮件文件夹,或{' '}
            <button
              type="button"
              onClick={backToForm}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              换个邮箱重试
            </button>
            。
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={loginHref}>去登录</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="CREATE ACCOUNT" brandTitle="创建你的 LVJIN 账号">
      <div className="space-y-7">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">创建账号</h2>
          <p className="text-sm text-muted-foreground">
            已有账号?{' '}
            <Link
              href={loginHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              去登录
            </Link>
          </p>
        </div>

        {oauthProviders.length > 0 && (
          <>
            <OAuthButtons next={next} disabled={submitting} />

            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                或使用邮箱注册
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>
          </>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handleSignup()
          }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              邮箱
            </Label>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={emailError || undefined}
                className="h-11 pl-10"
              />
            </div>
            {suggestion && (
              <p className="text-xs text-muted-foreground">
                是不是想输入{' '}
                <button
                  type="button"
                  onClick={() => setEmail(suggestion)}
                  className="font-medium text-primary hover:underline"
                >
                  {suggestion}
                </button>
                ?
              </p>
            )}
          </div>

          {/* Password + strength meter */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              密码
            </Label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={passwordError || undefined}
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex h-1 flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-full flex-1 rounded-full transition-colors',
                        i < strength.score ? strength.barClass : 'bg-border'
                      )}
                    />
                  ))}
                </div>
                <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground">
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
              确认密码
            </Label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="再次输入密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={confirmError || undefined}
                className="h-11 pl-10 pr-10"
              />
              {matches && (
                <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-emerald-400" />
              )}
            </div>
            {confirmError && <p className="text-xs text-destructive">两次输入的密码不一致</p>}
          </div>

          {/* Agree to terms */}
          <label className="flex cursor-pointer items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border bg-transparent accent-primary"
            />
            <span className="text-[11px] leading-relaxed text-muted-foreground">
              我已阅读并同意
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mx-1 underline underline-offset-2 hover:text-foreground"
              >
                服务条款
              </Link>
              与
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mx-1 underline underline-offset-2 hover:text-foreground"
              >
                隐私政策
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            disabled={submitting || !canSubmit}
            className="glow-primary-hover group relative h-11 w-full overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                创建中…
              </>
            ) : (
              <>
                创建账号
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  )
}
