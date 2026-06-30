'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Camera, Crown, Loader2, LogOut, Mail, Save, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CompanionIntroDialog } from '@/components/companion-intro-dialog'
import { Reveal, ShimmerText } from '@/components/effects'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'

/**
 * Account settings — locale-aware via the pathname (/ja → Japanese).
 */
export default function SettingsPage() {
  const { ready, isLoggedIn, user, profile, updateProfile, uploadAvatar, updatePassword, signOut } =
    useAuth()
  const { hasAccess, loading: entLoading } = useEntitlement()
  const isJa = usePathname()?.startsWith('/ja') ?? false

  const t = isJa
    ? {
        title: 'アカウント設定',
        subtitle: 'アバター・ニックネーム・アカウント情報を管理します。',
        profile: 'プロフィール',
        changeAvatar: 'アバターを変更',
        avatarHint: 'JPG / PNG、3MB 未満',
        username: 'ユーザー名',
        usernamePh: '名前を入力',
        bio: '自己紹介',
        bioPh: '一言で自己紹介（任意）',
        saveProfile: 'プロフィールを保存',
        account: 'アカウント',
        email: 'メールアドレス',
        tier: 'メンバー区分',
        upgrade: 'Plus にアップグレード',
        plusNote: '全講座・完全なドキュメント・コミュニティ投稿権限をアンロック済み（永久）。',
        companion: '電子学習パートナー',
        companionTitle: 'サイト全体で AI 学習パートナーを有効化',
        companionDesc: '回答時に応援・解説し、ドキュメントでも「解説」してくれます。AI の 1 日の利用枠を消費します。いつでもオフにできます。',
        companionAria: '電子学習パートナーの切り替え',
        changePw: 'パスワード変更',
        newPw: '新しいパスワード',
        pwPlaceholder: '6 文字以上',
        confirmPw: '新しいパスワード（確認）',
        confirmPlaceholder: 'もう一度入力',
        updatePw: 'パスワードを更新',
        signOut: 'ログアウト',
        dismiss: 'キャンセル',
        meFallback: '私',
        // toasts
        saveFail: '保存に失敗しました。もう一度お試しください',
        companionOff: '電子学習パートナーをオフにしました',
        companionOn: '電子学習パートナーを有効化しました。サイト全体で付き添います〜',
        pickImage: '画像ファイルを選択してください',
        imgTooBig: '画像は 3MB 未満にしてください',
        noBucket: 'アバター用ストレージが未作成です（SETTINGS 設定参照）',
        noBackend: 'バックエンドが未設定',
        uploadFail: 'アップロードに失敗しました',
        avatarSaveFail: 'アバターの保存に失敗しました',
        avatarUpdated: 'アバターを更新しました',
        usernameLen: 'ユーザー名は 2〜24 文字',
        usernameTaken: 'このユーザー名は使用されています',
        saved: '保存しました',
        pwShort: 'パスワードは 6 文字以上',
        mismatch: 'パスワードが一致しません',
        pwFail: '変更に失敗しました。後でお試しください',
        pwChanged: 'パスワードを変更しました',
        signedOut: 'ログアウトしました'
      }
    : {
        title: '账号设置',
        subtitle: '管理你的头像、昵称与账号信息。',
        profile: '个人资料',
        changeAvatar: '更换头像',
        avatarHint: 'JPG / PNG，小于 3MB',
        username: '用户名',
        usernamePh: '给自己起个名字',
        bio: '简介',
        bioPh: '一句话介绍自己（可选）',
        saveProfile: '保存资料',
        account: '账号',
        email: '邮箱',
        tier: '会员级别',
        upgrade: '升级 Plus',
        plusNote: '已解锁全部课程、完整文档与社区发帖权限，永久有效。',
        companion: '电子学习伴侣',
        companionTitle: '在全站开启 AI 学习伙伴',
        companionDesc: '答题时祝贺/讲解，文档里随手帮你「讲讲」。会消耗你的 AI 每日配额，随时可关。',
        companionAria: '电子学习伴侣开关',
        changePw: '修改密码',
        newPw: '新密码',
        pwPlaceholder: '至少 6 位',
        confirmPw: '确认新密码',
        confirmPlaceholder: '再输一次',
        updatePw: '更新密码',
        signOut: '退出登录',
        dismiss: '取消',
        meFallback: '我',
        saveFail: '保存失败，请重试',
        companionOff: '已关闭电子学习伴侣',
        companionOn: '电子学习伴侣已开启，它会在全站陪着你～',
        pickImage: '请选择图片文件',
        imgTooBig: '图片请小于 3MB',
        noBucket: '头像存储桶还没建（见 SETTINGS 配置）',
        noBackend: '后端未配置',
        uploadFail: '上传失败，请重试',
        avatarSaveFail: '保存头像失败',
        avatarUpdated: '头像已更新',
        usernameLen: '用户名需 2–24 个字符',
        usernameTaken: '该用户名已被占用',
        saved: '已保存',
        pwShort: '密码至少 6 位',
        mismatch: '两次输入的密码不一致',
        pwFail: '修改失败，请稍后重试',
        pwChanged: '密码已修改',
        signedOut: '已退出登录'
      }

  const unlockHref = isJa ? '/ja/unlock' : '/unlock'

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  const [companionOn, setCompanionOn] = useState(false)
  const [companionDialog, setCompanionDialog] = useState(false)
  const [savingCompanion, setSavingCompanion] = useState(false)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '')
      setBio(profile.bio ?? '')
      setAvatarUrl(profile.avatar_url ?? null)
      setCompanionOn(!!profile.companion_enabled)
    }
  }, [profile])

  const toggleCompanion = async (next: boolean) => {
    if (next) {
      setCompanionDialog(true)
      return
    }
    setSavingCompanion(true)
    const res = await updateProfile({ companion_enabled: false })
    setSavingCompanion(false)
    if (res.error) {
      toast.error(t.saveFail)
      return
    }
    setCompanionOn(false)
    toast.success(t.companionOff)
  }

  const enableCompanion = async () => {
    setSavingCompanion(true)
    const res = await updateProfile({ companion_enabled: true })
    setSavingCompanion(false)
    if (res.error) {
      toast.error(t.saveFail)
      return
    }
    setCompanionOn(true)
    setCompanionDialog(false)
    toast.success(t.companionOn)
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!isLoggedIn) return null // AuthGate redirects; this is a fallback

  const name = username || user?.email || t.meFallback
  const initial = name.slice(0, 1).toUpperCase()

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error(t.pickImage)
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error(t.imgTooBig)
      return
    }
    setUploading(true)
    const { url, error } = await uploadAvatar(file)
    if (error || !url) {
      setUploading(false)
      toast.error(
        /bucket/i.test(error ?? '')
          ? t.noBucket
          : error === 'not_configured'
            ? t.noBackend
            : t.uploadFail
      )
      return
    }
    const res = await updateProfile({ avatar_url: url })
    setUploading(false)
    if (res.error) {
      toast.error(t.avatarSaveFail)
      return
    }
    setAvatarUrl(url)
    toast.success(t.avatarUpdated)
  }

  const saveProfile = async () => {
    const u = username.trim()
    if (u.length < 2 || u.length > 24) {
      toast.error(t.usernameLen)
      return
    }
    setSavingProfile(true)
    const res = await updateProfile({ username: u, bio: bio.trim() })
    setSavingProfile(false)
    if (res.error) {
      toast.error(/duplicate|unique/i.test(res.error) ? t.usernameTaken : t.saveFail)
      return
    }
    toast.success(t.saved)
  }

  const changePassword = async () => {
    if (pw.length < 6) {
      toast.error(t.pwShort)
      return
    }
    if (pw !== pw2) {
      toast.error(t.mismatch)
      return
    }
    setSavingPw(true)
    const res = await updatePassword(pw)
    setSavingPw(false)
    if (res.error) {
      toast.error(t.pwFail)
      return
    }
    setPw('')
    setPw2('')
    toast.success(t.pwChanged)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Reveal>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <ShimmerText>{t.title}</ShimmerText>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </Reveal>

        {/* Profile */}
        <Reveal delay={60}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t.profile}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-20">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xl">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="gap-1.5"
                >
                  <Camera className="size-3.5" />
                  {t.changeAvatar}
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">{t.avatarHint}</p>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">{t.username}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePh}
                maxLength={24}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">{t.bio}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.bioPh}
                maxLength={160}
                className="min-h-20 resize-y"
              />
            </div>

            <Button onClick={saveProfile} disabled={savingProfile} className="gap-1.5">
              {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t.saveProfile}
            </Button>
          </CardContent>
        </Card>
        </Reveal>

        {/* Account */}
        <Reveal delay={120}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t.account}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" /> {t.email}
              </span>
              <span className="truncate text-sm font-medium">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="size-4" /> {t.tier}
              </span>
              <div className="flex items-center gap-3">
                {entLoading ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : hasAccess ? (
                  <Badge className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <Sparkles className="size-3" /> Plus
                  </Badge>
                ) : (
                  <>
                    <Badge variant="secondary">Free</Badge>
                    <Button asChild size="sm" className="glow-primary h-7">
                      <Link href={unlockHref}>{t.upgrade}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            {hasAccess && !entLoading && (
              <p className="text-xs text-muted-foreground">{t.plusNote}</p>
            )}
          </CardContent>
        </Card>
        </Reveal>

        {/* Companion (Plus only) */}
        {hasAccess && !entLoading && (
          <Reveal delay={180}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="size-4 text-primary" />
                {t.companion}
                <Badge variant="secondary" className="ml-1 gap-1 text-[10px]">
                  <Sparkles className="size-2.5" /> Plus
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t.companionTitle}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t.companionDesc}
                  </p>
                </div>
                <Switch
                  checked={companionOn}
                  onCheckedChange={toggleCompanion}
                  disabled={savingCompanion}
                  aria-label={t.companionAria}
                />
              </div>
            </CardContent>
          </Card>
          </Reveal>
        )}

        {/* Change password */}
        <Reveal delay={240}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t.changePw}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                changePassword()
              }}
            >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pw">{t.newPw}</Label>
                <Input
                  id="pw"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder={t.pwPlaceholder}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw2">{t.confirmPw}</Label>
                <Input
                  id="pw2"
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder={t.confirmPlaceholder}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={savingPw || !pw} className="gap-1.5">
              {savingPw && <Loader2 className="size-4 animate-spin" />}
              {t.updatePw}
            </Button>
            </form>
          </CardContent>
        </Card>
        </Reveal>

        <Button
          variant="ghost"
          onClick={async () => {
            await signOut()
            toast.success(t.signedOut)
          }}
          className="gap-2 text-muted-foreground"
        >
          <LogOut className="size-4" />
          {t.signOut}
        </Button>
      </main>

      <CompanionIntroDialog
        open={companionDialog}
        onOpenChange={setCompanionDialog}
        onEnable={enableCompanion}
        busy={savingCompanion}
        dismissLabel={t.dismiss}
      />

      <Footer />
    </div>
  )
}
