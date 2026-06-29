'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const isJa = pathname?.startsWith('/ja') ?? false
  const { enabled, ready, isLoggedIn, confirmationMethod, signUp, verifyOtp, resendOtp } =
    useAuth()

  const t = isJa
    ? {
        brandTitle: 'LVJIN アカウントを作成',
        invalidEmail: '有効なメールアドレスを入力してください',
        pwShort: 'パスワードは 6 文字以上',
        mismatch: 'パスワードが一致しません',
        mustAgree: '先に利用規約とプライバシーポリシーに同意してください',
        alreadyReg: 'このメールアドレスは登録済みです。ログインしてください',
        registered: '登録しました',
        otpIncomplete: '6 桁の確認コードを入力してください',
        otpUnsupported: '現在のバックエンドは確認コードに非対応です',
        otpWrong: '確認コードが違うか期限切れです',
        otpResent: '確認コードを再送信しました',
        commClosed: 'コミュニティは準備中',
        backendOff: 'アカウント登録はまだ接続されていません（',
        backendOff2: ' が未設定）。チュートリアルは通常どおり閲覧できます。',
        backHome: 'ホームへ戻る',
        otpTitle: '確認コードを入力',
        otpSentPre: '',
        otpSentPost: ' に 6 桁の確認コードを送信しました。入力すると登録が完了します。',
        verifying: '確認中…',
        verifyLogin: '確認してログイン',
        resendIn: (n: number) => `${n} 秒後に再送信できます`,
        notReceived: '届かない？ 迷惑メールを確認するか再送信',
        resend: '再送信',
        changeEmail: '← 別のメールで試す',
        verifyTitle: 'メールアドレスを確認',
        verifySentPre: '確認リンクを ',
        verifySentPost: ' に送信しました。メール内のリンクをクリックするとアカウントが有効化されログインします。',
        notReceived2Pre: '届かない？ 迷惑メールフォルダを確認するか、',
        notReceived2Btn: '別のメールで試す',
        notReceived2Post: '。',
        goLogin: 'ログインへ',
        createTitle: 'アカウント作成',
        haveAccount: 'すでにアカウントをお持ちの方は',
        login: 'ログイン',
        orEmail: 'またはメールで登録',
        email: 'メールアドレス',
        didYouMeanPre: 'もしかして ',
        didYouMeanPost: ' ?',
        password: 'パスワード',
        pwPlaceholder: '6 文字以上',
        hidePw: 'パスワードを隠す',
        showPw: 'パスワードを表示',
        confirmPw: 'パスワード（確認）',
        confirmPlaceholder: 'もう一度入力',
        agreePre: '',
        terms: '利用規約',
        and: 'と',
        privacy: 'プライバシーポリシー',
        agreePost: 'に同意します',
        creating: '作成中…',
        createBtn: 'アカウント作成'
      }
    : {
        brandTitle: '创建你的 LVJIN 账号',
        invalidEmail: '请输入有效邮箱',
        pwShort: '密码至少 6 位',
        mismatch: '两次输入的密码不一致',
        mustAgree: '请先同意服务条款与隐私政策',
        alreadyReg: '该邮箱已注册,请直接登录',
        registered: '注册成功',
        otpIncomplete: '请输入完整的 6 位验证码',
        otpUnsupported: '当前后端不支持验证码',
        otpWrong: '验证码不正确或已过期',
        otpResent: '验证码已重新发送',
        commClosed: '社区暂未开放',
        backendOff: '注册服务还没接通(',
        backendOff2: ' 未配置)。教程内容仍可正常访问。',
        backHome: '返回首页',
        otpTitle: '输入验证码',
        otpSentPre: '我们向 ',
        otpSentPost: ' 发送了一封 6 位验证码邮件,输入它即可完成注册。',
        verifying: '验证中…',
        verifyLogin: '验证并登录',
        resendIn: (n: number) => `${n} 秒后可重发`,
        notReceived: '没收到?检查垃圾邮件或重新发送',
        resend: '重新发送',
        changeEmail: '← 换个邮箱重试',
        verifyTitle: '验证你的邮箱',
        verifySentPre: '确认链接已发往 ',
        verifySentPost: '。点击邮件中的链接即可激活账号并登录。',
        notReceived2Pre: '没收到?检查垃圾邮件文件夹,或 ',
        notReceived2Btn: '换个邮箱重试',
        notReceived2Post: '。',
        goLogin: '去登录',
        createTitle: '创建账号',
        haveAccount: '已有账号?',
        login: '去登录',
        orEmail: '或使用邮箱注册',
        email: '邮箱',
        didYouMeanPre: '是不是想输入 ',
        didYouMeanPost: '?',
        password: '密码',
        pwPlaceholder: '至少 6 位',
        hidePw: '隐藏密码',
        showPw: '显示密码',
        confirmPw: '确认密码',
        confirmPlaceholder: '再次输入密码',
        agreePre: '我已阅读并同意',
        terms: '服务条款',
        and: '与',
        privacy: '隐私政策',
        agreePost: '',
        creating: '创建中…',
        createBtn: '创建账号'
      }

  const homeHref = isJa ? '/ja' : '/'
  const next = search.get('next') ?? homeHref
  const loginBase = isJa ? '/ja/login' : '/login'
  const loginHref = `${loginBase}${next !== homeHref ? `?next=${encodeURIComponent(next)}` : ''}`
  const termsHref = isJa ? '/ja/terms' : '/terms'
  const privacyHref = isJa ? '/ja/privacy' : '/privacy'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
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
    if (!validEmail) return toast.error(t.invalidEmail)
    if (!validPassword) return toast.error(t.pwShort)
    if (!matches) return toast.error(t.mismatch)
    if (!agree) return toast.error(t.mustAgree)

    setSubmitting(true)
    const { error, needsConfirmation } = await signUp(trimmed, password)
    setSubmitting(false)
    if (error) {
      toast.error(
        error.includes('already registered') || error.includes('already been registered')
          ? t.alreadyReg
          : error
      )
      return
    }
    if (needsConfirmation) {
      setSentTo(trimmed)
      if (confirmationMethod === 'otp') setResendIn(45)
    } else {
      toast.success(t.registered)
      router.replace(next)
    }
  }

  const handleVerifyOtp = async () => {
    if (!sentTo || otpCode.length < 6) {
      toast.error(t.otpIncomplete)
      return
    }
    setVerifying(true)
    const { error } = await verifyOtp(sentTo, otpCode)
    setVerifying(false)
    if (error) {
      toast.error(error === 'not_supported' ? t.otpUnsupported : t.otpWrong)
      return
    }
    toast.success(t.registered)
    router.replace(next)
  }

  const handleResendOtp = async () => {
    if (!sentTo || resendIn > 0) return
    const { error } = await resendOtp(sentTo)
    if (error) {
      toast.error(error)
      return
    }
    toast.success(t.otpResent)
    setResendIn(45)
  }

  const backToForm = () => {
    setSentTo(null)
    setOtpCode('')
    setPassword('')
    setConfirm('')
    setResendIn(0)
  }

  // Backend not configured → friendly placeholder.
  if (!enabled) {
    return (
      <AuthShell eyebrow="CREATE ACCOUNT" brandTitle={t.brandTitle}>
        <div className="space-y-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-amber-400" />
            <h2 className="text-lg font-semibold">{t.commClosed}</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.backendOff}
            <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_*</code>
            {t.backendOff2}
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href={homeHref}>{t.backHome}</Link>
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
        <AuthShell eyebrow="CREATE ACCOUNT" brandTitle={t.brandTitle}>
          <div className="space-y-6">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <KeyRound className="size-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{t.otpTitle}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t.otpSentPre}
                <strong className="break-all text-foreground">{sentTo}</strong>
                {t.otpSentPost}
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
                  {t.verifying}
                </>
              ) : (
                <>
                  {t.verifyLogin}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-4 py-3 text-xs">
              <span className="text-muted-foreground">
                {resendIn > 0 ? t.resendIn(resendIn) : t.notReceived}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendIn > 0}
                className="shrink-0 font-medium text-foreground underline underline-offset-4 hover:text-primary disabled:opacity-50 disabled:no-underline"
              >
                {t.resend}
              </button>
            </div>

            <button
              type="button"
              onClick={backToForm}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.changeEmail}
            </button>
          </div>
        </AuthShell>
      )
    }

    // Supabase (global) confirms with a clickable email link.
    return (
      <AuthShell eyebrow="CREATE ACCOUNT" brandTitle={t.brandTitle}>
        <div className="space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <MailCheck className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{t.verifyTitle}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t.verifySentPre}
              <strong className="break-all text-foreground">{sentTo}</strong>
              {t.verifySentPost}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {t.notReceived2Pre}
            <button
              type="button"
              onClick={backToForm}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              {t.notReceived2Btn}
            </button>
            {t.notReceived2Post}
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={loginHref}>{t.goLogin}</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="CREATE ACCOUNT" brandTitle={t.brandTitle}>
      <div className="space-y-7">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{t.createTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {t.haveAccount}{' '}
            <Link
              href={loginHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t.login}
            </Link>
          </p>
        </div>

        {oauthProviders.length > 0 && (
          <>
            <OAuthButtons next={next} disabled={submitting} />

            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {t.orEmail}
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
              {t.email}
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
                {t.didYouMeanPre}
                <button
                  type="button"
                  onClick={() => setEmail(suggestion)}
                  className="font-medium text-primary hover:underline"
                >
                  {suggestion}
                </button>
                {t.didYouMeanPost}
              </p>
            )}
          </div>

          {/* Password + strength meter */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              {t.password}
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
                placeholder={t.pwPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={passwordError || undefined}
                className="h-11 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.hidePw : t.showPw}
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
              {t.confirmPw}
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
                placeholder={t.confirmPlaceholder}
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
            {confirmError && <p className="text-xs text-destructive">{t.mismatch}</p>}
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
              {t.agreePre}
              <Link
                href={termsHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mx-1 underline underline-offset-2 hover:text-foreground"
              >
                {t.terms}
              </Link>
              {t.and}
              <Link
                href={privacyHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mx-1 underline underline-offset-2 hover:text-foreground"
              >
                {t.privacy}
              </Link>
              {t.agreePost}
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
                {t.creating}
              </>
            ) : (
              <>
                {t.createBtn}
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
