'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { AuthShell } from '@/components/auth-shell'
import { OAuthButtons } from '@/components/oauth-buttons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/use-auth'
import { isValidEmail } from '@/lib/email-utils'
import { oauthProviders } from '@/lib/region'

function LoginContent() {
  const router = useRouter()
  const search = useSearchParams()
  const pathname = usePathname()
  const isJa = pathname?.startsWith('/ja') ?? false
  const { enabled, ready, isLoggedIn, signInWithPassword } = useAuth()

  const t = isJa
    ? {
        checkInput: 'メールアドレスとパスワードを確認してください（パスワードは 6 文字以上）',
        badCreds: 'メールアドレスまたはパスワードが違います',
        loggedIn: 'ログインしました',
        commClosed: 'コミュニティは準備中',
        backendOff: 'ログイン機能はまだ接続されていません（',
        backendOff2: ' が未設定）。チュートリアルは通常どおり閲覧できます。',
        backHome: 'ホームへ戻る',
        title: 'LVJIN にログイン',
        noAccount: 'アカウントをお持ちでない方は',
        signup: '新規登録',
        orEmail: 'またはメールで',
        email: 'メールアドレス',
        password: 'パスワード',
        forgot: 'パスワードをお忘れ？',
        pwPlaceholder: '6 文字以上',
        hidePw: 'パスワードを隠す',
        showPw: 'パスワードを表示',
        loggingIn: 'ログイン中…',
        loginBtn: 'ログイン',
        agreePre: '続行すると、当社の',
        terms: '利用規約',
        and: 'と',
        privacy: 'プライバシーポリシー',
        agreePost: 'に同意したものとみなされます。'
      }
    : {
        checkInput: '请检查邮箱与密码(密码至少 6 位)',
        badCreds: '邮箱或密码错误',
        loggedIn: '登录成功',
        commClosed: '社区暂未开放',
        backendOff: '登录服务还没接通(',
        backendOff2: ' 未配置)。教程内容仍可正常访问。',
        backHome: '返回首页',
        title: '登录 LVJIN',
        noAccount: '还没账号?',
        signup: '立即注册',
        orEmail: '或使用邮箱',
        email: '邮箱',
        password: '密码',
        forgot: '忘记密码?',
        pwPlaceholder: '至少 6 位',
        hidePw: '隐藏密码',
        showPw: '显示密码',
        loggingIn: '登录中…',
        loginBtn: '登录',
        agreePre: '继续即表示同意我们的',
        terms: '服务条款',
        and: '与',
        privacy: '隐私政策',
        agreePost: '。'
      }

  const homeHref = isJa ? '/ja' : '/'
  const next = search.get('next') ?? homeHref

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (ready && isLoggedIn) router.replace(next)
  }, [ready, isLoggedIn, next, router])

  const trimmed = email.trim()
  const validEmail = isValidEmail(trimmed)
  const validPassword = password.length >= 6
  const emailError = touched && trimmed.length > 0 && !validEmail
  const passwordError = touched && password.length > 0 && !validPassword

  const handlePasswordLogin = async () => {
    setTouched(true)
    if (!validEmail || !validPassword) {
      toast.error(t.checkInput)
      return
    }
    setSubmitting(true)
    const { error } = await signInWithPassword(trimmed, password)
    setSubmitting(false)
    if (error) {
      toast.error(error === 'Invalid login credentials' ? t.badCreds : error)
      return
    }
    toast.success(t.loggedIn)
    router.replace(next)
  }

  const signupBase = isJa ? '/ja/signup' : '/signup'
  const signupHref = `${signupBase}${next !== homeHref ? `?next=${encodeURIComponent(next)}` : ''}`
  const forgotHref = isJa ? '/ja/forgot-password' : '/forgot-password'
  const termsHref = isJa ? '/ja/terms' : '/terms'
  const privacyHref = isJa ? '/ja/privacy' : '/privacy'

  // Backend not configured → friendly placeholder so the page never 500s.
  if (!enabled) {
    return (
      <AuthShell>
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

  return (
    <AuthShell>
      <div className="space-y-7">
        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
          <p className="text-sm text-muted-foreground">
            {t.noAccount}{' '}
            <Link
              href={signupHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t.signup}
            </Link>
          </p>
        </div>

        {oauthProviders.length > 0 && (
          <>
            <OAuthButtons next={next} disabled={submitting} />

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {t.orEmail}
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>
          </>
        )}

        {/* Email + password form */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            handlePasswordLogin()
          }}
        >
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
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                {t.password}
              </Label>
              <Link
                href={forgotHref}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {t.forgot}
              </Link>
            </div>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
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
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="glow-primary-hover group relative h-11 w-full overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t.loggingIn}
              </>
            ) : (
              <>
                {t.loginBtn}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {t.agreePre}
          <Link href={termsHref} className="mx-1 underline underline-offset-2 hover:text-foreground">
            {t.terms}
          </Link>
          {t.and}
          <Link href={privacyHref} className="mx-1 underline underline-offset-2 hover:text-foreground">
            {t.privacy}
          </Link>
          {t.agreePost}
        </p>
      </div>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
