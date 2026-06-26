'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
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
 * Account settings — edit avatar / username / bio, view membership tier and
 * change password. Gated by the site-wide AuthGate (logged-in only); this only
 * guards the brief loading window.
 */
export default function SettingsPage() {
  const { ready, isLoggedIn, user, profile, updateProfile, uploadAvatar, updatePassword, signOut } =
    useAuth()
  const { hasAccess, loading: entLoading } = useEntitlement()

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

  // Hydrate the form once the profile arrives.
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
      // Turning ON → explain first, persist on confirm.
      setCompanionDialog(true)
      return
    }
    setSavingCompanion(true)
    const res = await updateProfile({ companion_enabled: false })
    setSavingCompanion(false)
    if (res.error) {
      toast.error('保存失败，请重试')
      return
    }
    setCompanionOn(false)
    toast.success('已关闭电子学习伴侣')
  }

  const enableCompanion = async () => {
    setSavingCompanion(true)
    const res = await updateProfile({ companion_enabled: true })
    setSavingCompanion(false)
    if (res.error) {
      toast.error('保存失败，请重试')
      return
    }
    setCompanionOn(true)
    setCompanionDialog(false)
    toast.success('电子学习伴侣已开启，它会在全站陪着你～')
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!isLoggedIn) return null // AuthGate redirects; this is a fallback

  const name = username || user?.email || '我'
  const initial = name.slice(0, 1).toUpperCase()

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('图片请小于 3MB')
      return
    }
    setUploading(true)
    const { url, error } = await uploadAvatar(file)
    if (error || !url) {
      setUploading(false)
      toast.error(
        /bucket/i.test(error ?? '')
          ? '头像存储桶还没建（见 SETTINGS 配置）'
          : error === 'not_configured'
            ? '后端未配置'
            : '上传失败，请重试'
      )
      return
    }
    const res = await updateProfile({ avatar_url: url })
    setUploading(false)
    if (res.error) {
      toast.error('保存头像失败')
      return
    }
    setAvatarUrl(url)
    toast.success('头像已更新')
  }

  const saveProfile = async () => {
    const u = username.trim()
    if (u.length < 2 || u.length > 24) {
      toast.error('用户名需 2–24 个字符')
      return
    }
    setSavingProfile(true)
    const res = await updateProfile({ username: u, bio: bio.trim() })
    setSavingProfile(false)
    if (res.error) {
      toast.error(/duplicate|unique/i.test(res.error) ? '该用户名已被占用' : '保存失败，请重试')
      return
    }
    toast.success('已保存')
  }

  const changePassword = async () => {
    if (pw.length < 6) {
      toast.error('密码至少 6 位')
      return
    }
    if (pw !== pw2) {
      toast.error('两次输入的密码不一致')
      return
    }
    setSavingPw(true)
    const res = await updatePassword(pw)
    setSavingPw(false)
    if (res.error) {
      toast.error('修改失败，请稍后重试')
      return
    }
    setPw('')
    setPw2('')
    toast.success('密码已修改')
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <Reveal>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <ShimmerText>账号设置</ShimmerText>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">管理你的头像、昵称与账号信息。</p>
          </div>
        </Reveal>

        {/* 个人资料 */}
        <Reveal delay={60}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">个人资料</CardTitle>
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
                  更换头像
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">JPG / PNG，小于 3MB</p>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="给自己起个名字"
                maxLength={24}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">简介</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="一句话介绍自己（可选）"
                maxLength={160}
                className="min-h-20 resize-y"
              />
            </div>

            <Button onClick={saveProfile} disabled={savingProfile} className="gap-1.5">
              {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              保存资料
            </Button>
          </CardContent>
        </Card>
        </Reveal>

        {/* 账号 */}
        <Reveal delay={120}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">账号</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" /> 邮箱
              </span>
              <span className="truncate text-sm font-medium">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Crown className="size-4" /> 会员级别
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
                      <Link href="/unlock">升级 Plus</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            {hasAccess && !entLoading && (
              <p className="text-xs text-muted-foreground">
                已解锁全部课程、完整文档与社区发帖权限，永久有效。
              </p>
            )}
          </CardContent>
        </Card>
        </Reveal>

        {/* 电子学习伴侣（仅 Plus） */}
        {hasAccess && !entLoading && (
          <Reveal delay={180}>
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="size-4 text-primary" />
                电子学习伴侣
                <Badge variant="secondary" className="ml-1 gap-1 text-[10px]">
                  <Sparkles className="size-2.5" /> Plus
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">在全站开启 AI 学习伙伴</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    答题时祝贺/讲解，文档里随手帮你「讲讲」。会消耗你的 AI 每日配额，随时可关。
                  </p>
                </div>
                <Switch
                  checked={companionOn}
                  onCheckedChange={toggleCompanion}
                  disabled={savingCompanion}
                  aria-label="电子学习伴侣开关"
                />
              </div>
            </CardContent>
          </Card>
          </Reveal>
        )}

        {/* 修改密码 */}
        <Reveal delay={240}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">修改密码</CardTitle>
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
                <Label htmlFor="pw">新密码</Label>
                <Input
                  id="pw"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="至少 6 位"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw2">确认新密码</Label>
                <Input
                  id="pw2"
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="再输一次"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={savingPw || !pw} className="gap-1.5">
              {savingPw && <Loader2 className="size-4 animate-spin" />}
              更新密码
            </Button>
            </form>
          </CardContent>
        </Card>
        </Reveal>

        <Button
          variant="ghost"
          onClick={async () => {
            await signOut()
            toast.success('已退出登录')
          }}
          className="gap-2 text-muted-foreground"
        >
          <LogOut className="size-4" />
          退出登录
        </Button>
      </main>

      <CompanionIntroDialog
        open={companionDialog}
        onOpenChange={setCompanionDialog}
        onEnable={enableCompanion}
        busy={savingCompanion}
        dismissLabel="取消"
      />

      <Footer />
    </div>
  )
}
