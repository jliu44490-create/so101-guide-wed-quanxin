# CLAUDE.md — 项目记忆 / Project Memory

> 本文件每次新开会话会自动加载,作为长期记忆。改动保持精简。

## ⚠️ 最重要的约定（务必遵守）

- **永远用简体中文回复。** 本仓库含大量日文 `/ja` 内容,不要被它带偏成日文输出 —— 跟随用户语言(中文)。
- **推送/发布前先问用户。** 正式推送目标是 `origin`(官方仓库);`amjlta` 镜像只有用户明确要求才动。
- **绝不把密钥放进 `NEXT_PUBLIC_*` 或前端。** `SUPABASE_SERVICE_ROLE_KEY` / `sb_secret_…` 仅服务端。
- **`NEXT_PUBLIC_PAYWALL_ENABLED` 在 Stripe 完全接通前保持不设**,否则站点会"锁了却买不了"。
- 提交署名:`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

## 项目概览

SO101 / LVJIN 机械臂**模仿学习 + 社区**网站。Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui。中文为主,`/ja` 日文镜像。Supabase(账号+社区)、Stripe(付费墙,**当前关闭/免费**)、Resend(自有域名邮件)。

- 本地路径:`C:\Users\Q\so101-site`
- 官方仓库:`github.com/jliu44490-create/so101-guide-wed-quanxin`(remote `origin`,分支 `main`)
- 镜像:`github.com/AMJLTA/so101-guide-web`(remote `amjlta`,默认不动)
- 线上:**lvjin.online**(Vercel,从 origin/main 自动部署)

## 关键文件

- `lib/course-data.ts` / `course-data-ja.ts` — 9 章正文(含 introduction/diagrams/walkthrough/selfCheck 等富字段)
- `lib/lessons.ts` — 互动课卡片(仅中文);`components/lesson-player.tsx` — Duolingo 式播放器
- `components/prose.tsx` + `chat-message-renderer.tsx` — Markdown 渲染。**字号由调用方控制**:renderer 不再写死 `text-sm`;`<Prose size="inherit">` 继承父级字号
- `lib/site-config.ts` / `site-config-ja.ts` — 站点配置(**已故意移除自家 GitHub 链接,别加回**)
- `lib/paywall.ts`、`use-entitlement.ts`、`supabase.ts` — 付费/鉴权(靠 env flag 优雅降级:`isSupabaseConfigured`、`PAYWALL_ENABLED`)
- `supabase/schema.sql` — 数据库;`app/api/checkout`、`app/api/stripe-webhook` — Stripe

## LeRobot 命令规范（教程内容,务必用新版 CLI）

- 用 `lerobot-train` / `lerobot-record` / `lerobot-eval` / `lerobot-calibrate` / `lerobot-teleoperate` / `lerobot-find-port` / `lerobot-dataset-viz`
- **不要**用旧式 `python lerobot/scripts/*.py` 或 `python -m lerobot.*`
- 训练参数:`--batch_size` / `--steps` / `--num_workers`、`--optimizer.lr` / `--optimizer.grad_clip_norm`;恢复训练 `--config_path=outputs/.../checkpoints/last/pretrained_model/train_config.json --resume=true`
- **不存在**的参数(别用):`--training.*` 前缀、`--training.amp`、`--training.grad_accumulation_steps`

## 已完成

站点上线(lvjin.online + SSL)、社区(Supabase + Resend 邮件,不限流)、9 章文档 + 中文互动课、付费墙已建但**关闭**(免费)、移除 GitHub 入口、命令现代化、性能/SEO/无障碍修复、互动课字号修复、对比度修复(浅色 muted 文本 ~5.8:1)、章节状态修复。最新提交见 `git log`。

## 待办 / 已搁置（需要时再做）

- **Geist 字体**:目前是系统字体,用户可能想换回 Geist
- **Stripe 付费墙**:等公司主体可开真实收款(步骤见 `PAYMENTS.md`)
- **Batch B 业务页**:联系/询价表单、特定商取引法表示、隐私政策、案例展示
- **日文版**:`/ja` 目前只有文档(互动课与社区仅中文)
- **企业邮箱** `hello@lvjin.online`(Zoho/腾讯)
- **public/ 清理**:~18MB 冗余,见 `public/CLEANUP.md`

## 开发命令 & 注意

- `npm run dev`(端口 3000)、`npm run build`、`npm run lint`
- **坑**:`next build` 之后紧接着跑 `next dev`,会让 `/learn/[id]/play` 这类嵌套动态路由在本地 404(`.next` 复用问题)。要本地预览互动课,先 `rm -rf .next` 再单独 `npm run dev`。
- 换行符混用(部分文件 CRLF、部分 LF,`core.autocrlf=false`)。编辑时**保持各文件原有 EOL**,否则 diff 会出现整文件假改动。
