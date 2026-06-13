-- ============================================================================
-- SO101 社区 — CloudBase PostgreSQL schema（中国版 / cn region）
-- ============================================================================
-- 在 CloudBase 控制台 → SQL 型数据库 → 「登录」打开 SQL 控制台，整段粘贴运行一次。
-- 重复运行安全（if not exists）。
--
-- 与 supabase/schema.sql 的区别（CloudBase 数据访问模型不同）：
--   · 不引用 auth.users —— CloudBase 认证是独立体系，id 直接存 CloudBase uid（text）
--   · 不建触发器 —— 没有 Supabase 的 handle_new_user，profile 由 App 在注册时创建
--   · 不开 RLS / auth.uid() —— 权限由 CloudBase「数据模型」的权限规则控制
--   · 不建视图 —— 作者信息 / 点赞数由前端 (cloudbase-community.ts) 拼装
-- 建表后，需在控制台「数据模型」为这 4 张表各建一个数据模型并配权限规则。
-- ============================================================================

-- 1. 用户资料 -----------------------------------------------------------------
create table if not exists profiles (
  id          text primary key,            -- CloudBase auth uid
  username    text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

-- 2. 评论 / 讨论 --------------------------------------------------------------
-- thread_key 形如 'chapter:1'、'error:cuda out of memory'。
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  thread_key  text not null,
  author_id   text not null,
  body        text not null check (char_length(body) between 1 and 5000),
  parent_id   uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists comments_thread_idx on comments (thread_key, created_at);

-- 3. 点赞 ---------------------------------------------------------------------
create table if not exists comment_votes (
  comment_id  uuid not null,
  user_id     text not null,
  created_at  timestamptz not null default now(),
  primary key (comment_id, user_id)
);
create index if not exists comment_votes_comment_idx on comment_votes (comment_id);

-- 4. 付费权益（买断永久解锁；由服务端写入，前端只读自己的） --------------------
create table if not exists entitlements (
  user_id           text primary key,
  product           text not null default 'all-access',
  source            text,
  stripe_session_id text,
  created_at        timestamptz not null default now()
);
