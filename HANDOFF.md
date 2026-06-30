# HANDOFF —— 接手须知

> 给新会话:读这份就能接上,不用让用户重讲。回复用**简体中文**;**推送 main / 触发上线前先问用户**。
> 最后更新:2026-06-30。

---

## 0. 一句话现状(两条并行线)

1. **国际版 `lvjin.online`(Vercel)= 主线,持续在做、状态健康。** 截至 2026-06-30 已完成「日文全站平价化 + 社区对所有人开放」并全部推 `origin/main` 上线(见 §0.5)。
2. **中国版(大陆可直连版)= 支线,暂停中。** 认证已搭通并上线 `cn.lvjin.online`(香港),但撞上核心坎:大陆直连太慢、不可用;社区云函数代码写完未部署。等用户定"怎么解决慢"的方向(见 §3–5)。

---

## 0.5 国际版近期交付(2026-06-30,已全部上线 origin/main)

本批工作让日文版 `/ja` 与中文版**功能平价**,并把社区改为开放。全部已构建/lint 通过、推送上线:

- **日文全站覆盖**:9 章富内容 + 互动课(`/ja/learn/[id]` + `/play`)、社区页 `/ja/community`、法律页 `/ja/terms` `/ja/privacy`、解锁页 `/ja/unlock`、账号/认证页(login/signup/forgot/reset/settings + `/ja/u/[username]`)、现代 AI 页 `/ja/ai`(`/ja/assistant` 已永久重定向过去,旧关键词引擎已删)。
- **日文付费墙**:与中文一致(前 2 章免费、其余买断),`ContentGate`/`PaywallGate` 已 locale-aware。
- **共用组件本地化**:header/footer、discussion、learning-companion、command-palette、setup-wizard(+`lib/scaffold` 加 `loc` 参数)、content-gate 等全部按 `usePathname` 的 `isJa` 分支。
- **`/ja/learn` 对齐中文**:补 LearnHud(等级/XP/徽章)+ 🗺️ 学習マップ(LearnPath);`useChapters()` 按路径选 `chaptersJa`/中文数据。
- **社区对所有登录用户开放(不再需 Plus/解锁)**:`discussion.tsx` 去掉发帖的 entitlement 门(只留登录要求);章节页把 `<Discussion>` 移到 `ContentGate` 外,被锁章节也能讨论;DB RLS 本就只校验登录。相关「社区=Plus 权益」的文案已从 `UNLOCK_BENEFITS`/paywall-gate/unlock 页/账号设置/PAYMENTS.md 移除。
- 翻译均为 AI 生成,**建议后续找懂日文的人校一遍**(尤其法律/付费文案)。

> 模式:逐批 build+lint+预览验证 → 本地 commit → **推送前问用户**。详细历程见 `git log` 与记忆 `project_ja_parity.md`。

---

## 1. 项目背景

- SO101 / LVJIN 机械臂**模仿学习 + 社区**教学网站。Next.js 16 (App Router) + TS + Tailwind v4 + shadcn/ui。中文为主,`/ja` 日文镜像。
- 本地:`C:\Users\Q\so101-site`。官方仓库 `github.com/jliu44490-create/so101-guide-wed-quanxin`(remote `origin`,分支 `main`)。
- **两个部署目标,一套代码**(靠环境变量区分):
  - 国际版 → **Vercel** → `lvjin.online`(`NEXT_PUBLIC_REGION` 不设 = global)。
  - 中国版 → **Zeabur 香港服务器** → `cn.lvjin.online`(`NEXT_PUBLIC_REGION=cn`)。

---

## 2. 区域解耦架构(已完成,理解这个就懂全局)

- `lib/region.ts`:`NEXT_PUBLIC_REGION=cn|global`(缺省 global)。派生 `oauthProviders`(CN 为空)、`analyticsEnabled`(CN 关)、`backendKind`(CN=cloudbase)。
- `lib/backend/`:**后端抽象层**,UI 不直连 SDK。
  - 认证:`AuthBackend` 接口(`types.ts`)+ `supabase-backend.ts`(global)+ `cloudbase-backend.ts`(cn)+ `index.ts` 按 region 选。
  - 社区:`CommunityBackend` 接口(`community-types.ts`)+ `supabase-community.ts`(global)+ `cloudbase-community.ts`(cn)。
  - `cloudbase-app.ts`:CN 区认证+社区**共用一个** `@cloudbase/js-sdk` 实例。
- `lib/use-auth.ts` / `use-entitlement.ts` / `components/discussion.tsx` 都走抽象层,不直连。
- **global 行为完全不变**(CN 逻辑全在 region 门后 + 动态 import,Vercel 构建零回归,已多次验证)。

---

## 3. 中国版认证(✅ 已完成并上线)

- 后端 = **腾讯云 CloudBase**(env `lvjin-d7g6dmac8ef71a099`,region `ap-shanghai`,数据库选了 **PostgreSQL 17**,实例 `postgres-rki2tk02`)。该 PG **底层是 Supabase 栈**(有 `auth`/`storage`/`supavisor` schema)。
- **关键发现**:`@cloudbase/js-sdk` v3 认证 API 高度 Supabase 兼容(`signInWithPassword`/`getSession`/`onAuthStateChange`/`resetPasswordForEmail`,全 `{data,error}`)。所以 `cloudbase-backend.ts` 几乎 1:1 照抄。
- **注册走邮箱 OTP**:CloudBase `signUp` 后要 `verifyOtp`(6 位码)。已做:`AuthBackend` 加了 `confirmationMethod('link'|'otp')` + `verifyOtp`/`resendOtp`;注册页 `app/signup/page.tsx` 按它分支(CN 显示 6 格验证码,global 仍邮件链接)。
- **实测通过**:真邮箱在 `cn.lvjin.online` 注册→收 CloudBase 6 位码→验证→自动登录,全通。
- 配置(都是前端公开 key,非密钥):`NEXT_PUBLIC_CLOUDBASE_ENV/REGION/ACCESS_KEY`。本地在 `.env.local`;**Zeabur 不可靠地传 build args,所以已硬编码进 `Dockerfile` 的 ARG 默认值**(publishable key 是公开 anon,无妨)。

---

## 4. 中国版部署(✅ 已上线,但有核心问题)

- 托管:**Zeabur**(自带服务器 BYOC)→ 买了**腾讯云香港 2核/4GB,$10/月**,IPv4 `124.156.180.225`。从 GitHub 仓库读 `Dockerfile` 构建(`output:'standalone'` 仅 CN 构建生效)。
- 域名:`cn.lvjin.online`(阿里云云解析加了 A 记录 `cn → 124.156.180.225`;域名在阿里云买的,`www`/`@` 是 Vercel 主站没动)。HTTPS 绿锁、认证可用。
- **CloudBase 套餐**:体验版(免费)**不让加自定义 WEB 安全域名**(`OperationDenied.FreePackageDenied`)。用户**已升级套餐**,在「环境管理→跨域设置」加了 `cn.lvjin.online` + `lvjin.zeabur.app`,SDK 才放行。
- 部署细节见 `cloudbase/DEPLOY-CN.md`。

### ⚠️⚠️ 核心拦路问题(当前暂停在这)

**大陆直连 `cn.lvjin.online` 极慢、不可用。** 免备案香港走国际出口,大陆访问慢、晚高峰更差 —— 这是**免备案 HK 的物理死结**,非配置问题(早就标过"非真直连")。
（本机量不准:用户跑着 Clash,TUN/fake-ip 把 DNS 劫持成 198.18.x.x、ICMP 也劫持成 0ms。验证真实解析用 DoH:`curl https://dns.google/resolve?name=cn.lvjin.online&type=A`。测真直连要关 Clash。）

**出路(用户暂未选)**:
- **a.(推荐先试)CloudBase 云托管(上海)**:把**同一个 Dockerfile 容器**部署到 CloudBase 自家容器托管(在上海),用默认 `xxx.tcloudbaseapp.com` 域名 → **免备案 + 大陆秒开**;且同区域后端更快、**域名自动在白名单(社区数据的 CORS 问题顺带解决)**。代价:域名丑(cn.lvjin.online 仍需备案才能用)、Zeabur $10 沉没。复用现成 Dockerfile,不重写。
- **b. 备案 + 国内云 + `lvjin.cn`**:真秒开 + 漂亮域名,需**公司主体 + 备案(~2-3 周)**。一劳永逸。
- **c.**(不推荐)香港换 CN2 GIA 贵线路 / 海外 CDN。

---

## 5. 社区评论数据(🔧 代码做完,未部署,暂停)

浏览器**直连 CloudBase 数据走不通**:supabase-js/裸 fetch 被 CORS 拦;`app.models.$runSQL` 报 network error 且不安全(浏览器跑任意 SQL)。**结论:走云函数。**

已做(本地领先 origin 2 个提交,**未推送**;社区开关默认关,推不推都不影响线上):
- 云函数:`cloudbase/functions/community/`(`index.js` + `package.json`)。用 `pg` 连**内网** PG + `app.auth().getUserInfo()` 拿调用者 uid 鉴权 + 自动建 profile。actions:`listThread/postComment/deleteComment/setLike/getProfile/getEntitlement`。表已建(`cloudbase/schema.sql`,已在 PG 跑过)。
- 前端:`cloudbase-community.ts` 已接 `app.callFunction('community', {action,...})`,**用开关 `NEXT_PUBLIC_CLOUDBASE_COMMUNITY=1` 门控**(默认关 → 仍显示"即将开放"占位)。

**恢复社区只差**(等托管方向定了再做,尤其若搬到云托管会更顺):
1. 部署 `community` 云函数(控制台云函数上传 `cloudbase/functions/community.zip`,或用 CloudBase CLI `tcb fn deploy`)。
2. 配函数 5 个 PG 环境变量:`PGHOST=172.17.0.8` `PGPORT=5432` `PGUSER=AMJLTA` `PGPASSWORD=<用户的数据库密码>` `PGDATABASE=postgres`。
3. **核实云函数能否连到 PG 内网**(是否同 VPC?连不上就开 PG 外网 IP、用外网地址)。
4. 测函数跑通。
5. 前端设 `NEXT_PUBLIC_CLOUDBASE_COMMUNITY=1`(加进 Dockerfile,跟其它一样)+ 推送 → Zeabur 重建激活。
   - 注意:数据库账号 `AMJLTA` 是 superuser(建表时用)。`getUserInfo().uid` 是否等于浏览器 `user.id` 要在测时确认。

---

## 6. 其它待办(都没动)

- `/reset-password` 的 CN 流程(CloudBase 恢复会话流;`cloudbase-backend.updatePassword` 现返回 not_configured)。
- `loadProfile`(CN 现返回 null,所以登录后头像只有邮箱首字母)—— 接社区时一起补(可调云函数 `getProfile`)。
- 内容本地化:正文里 YouTube/HF 外链可换 B站等(需用户提供链接)。
- 国际版老搁置项见 `CLAUDE.md`(Geist 字体、Stripe 付费墙、Batch B 业务页、`public/` 清理)。

---

## 7. 关键文件速查

- 区域开关:`lib/region.ts`
- 后端抽象:`lib/backend/*`(`cloudbase-backend.ts` 认证、`cloudbase-community.ts` 社区、`cloudbase-app.ts` 共享实例)
- 认证页:`app/{login,signup,forgot-password,reset-password}/page.tsx`;`components/auth-shell.tsx`(工业风左栏)、`robot-arm-blueprint.tsx`(机械臂装饰)、`oauth-buttons.tsx`
- 云函数:`cloudbase/functions/community/`
- CN schema:`cloudbase/schema.sql`(已在 PG 跑过)
- 部署:`Dockerfile`(CN 容器,CloudBase 公开配置已硬编码进 ARG)、`cloudbase/DEPLOY-CN.md`
- 长期记忆:`~/.claude/.../memory/project_so101_cn_version.md`(同样内容,背景上下文)
