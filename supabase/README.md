# 社区后端配置（Supabase）

网站的账号系统和讨论区跑在 Supabase 上。**还没配置时网站照常运行**，讨论区会显示"即将开放"。配好后立刻激活。全程约 15 分钟。

---

## 1. 创建 Supabase 项目

1. 打开 https://supabase.com → 用 GitHub 登录（免费）
2. **New project** → 起个名（如 `so101-community`）→ 选区域（海外用户选 Singapore / Tokyo）→ 设个数据库密码（自己存好）
3. 等 1-2 分钟项目初始化完成

## 2. 建表

1. 左侧 **SQL Editor** → **New query**
2. 把 `supabase/schema.sql` **整个文件**粘进去 → **Run**
3. 看到 "Success" 就建好了（profiles / comments / comment_votes 三张表 + 视图）

## 3. 开启登录方式

左侧 **Authentication → Providers**：

### ⚡ 最快路径：只用邮箱登录（推荐先这样上线）
- Authentication → Providers → **Email** → 确保开启（**新项目默认就是开的**）
- 默认就是 magic link（无密码），**零额外配置**
- 这一项搞定，社区就能用了。GitHub 登录可以等以后再加。

### （可选）以后加 GitHub 一键登录
邮箱登录跑通后想再加 GitHub，再做这步：
1. 打开 GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. 填：
   - Application name: `SO101 社区`
   - Homepage URL: `https://so101-guide-web-seven.vercel.app`
   - Authorization callback URL: **从 Supabase 的 GitHub provider 页面复制那个 callback URL**（形如 `https://xxxx.supabase.co/auth/v1/callback`）
3. 拿到 Client ID + 生成 Client Secret，填回 Supabase 的 GitHub provider，**保存 + 开启**
4. **最后一步**：在 Vercel 环境变量里加 `NEXT_PUBLIC_ENABLE_GITHUB_AUTH=true` 再 Redeploy
   —— 登录框里的「用 GitHub 登录」按钮默认隐藏，加了这个开关才出现（避免没配好就显示一个点了报错的按钮）。

## 4. 配置允许的回跳地址

**Authentication → URL Configuration**：
- **Site URL**: `https://so101-guide-web-seven.vercel.app`
- **Redirect URLs** 添加：
  - `https://so101-guide-web-seven.vercel.app/**`
  - `http://localhost:3000/**`（本地开发用）

## 5. 把密钥填进 Vercel

1. 复制两个值（Supabase 新版控制台把它们分到两个页面）：
   - **Project URL** —— 在 Settings → **Data API** 页，形如 `https://xxxx.supabase.co`
   - **Publishable key**（`sb_publishable_...`）—— 在 Settings → **API Keys** 页
     - ⚠️ 用 Publishable key，**不要** Secret key（`sb_secret_...`，那是后端机密，放前端等于裸奔）
     - 旧项目若只有 Legacy 的 `anon`（`eyJ...`）key 也能用，效果一样
2. 打开 Vercel 项目 → Settings → Environment Variables，加两条：

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | 上面的 Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 上面的 anon key |

   Scope 选 Production + Preview + Development 全勾。
3. **Redeploy** 一次让环境变量生效。

## 6. 验证

部署完成后访问任意章节页（如 `/learn/1`）拉到底部 —— 讨论区应该出现，顶栏右上多出"登录"按钮。点登录 → GitHub / 邮箱都能进。发一条评论试试。

---

## 安全说明

- 用的是 **anon key**，配合数据库的 **RLS（行级安全）策略** —— 任何人能读评论，但只能增删改**自己的**评论。这是 Supabase 的标准安全模型，anon key 公开在前端是设计如此，安全边界在 RLS。
- `service_role` key **永远不要**放进前端或 `NEXT_PUBLIC_` 变量。本项目不需要它。

## 二期（大陆）要做的

- 海外架构（GitHub OAuth + Supabase + Vercel）大陆访问会慢/不稳。
- 大陆正式上线需要：ICP 备案、国内服务器/CDN 镜像、手机号/微信登录、内容审核机制。
- 这些是 phase 2，当前 v1 面向全球华人（海外 + 港澳台）。
