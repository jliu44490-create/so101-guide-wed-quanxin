-- ============================================================================
-- SO101 社区 — 数据库 schema
-- ============================================================================
-- 在 Supabase 控制台 → SQL Editor 里整段粘贴运行一次即可。
-- 重复运行安全（用了 if not exists / or replace）。
-- ============================================================================

-- 1. 用户资料表 ------------------------------------------------------------
-- 每个 auth.users 对应一行 profile。username / avatar 由注册时的触发器填充。

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update using ((select auth.uid()) = id);

-- 注册时自动创建 profile，用户名优先取 GitHub 用户名，否则用 user_前8位id
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      'user_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. 评论 / 讨论表 ---------------------------------------------------------
-- thread_key 形如 'chapter:1'、'error:cuda out of memory'。
-- parent_id 预留给将来的楼中楼（v1 前端按时间平铺渲染）。

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  thread_key  text not null,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 5000),
  parent_id   uuid references public.comments(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists comments_thread_idx
  on public.comments (thread_key, created_at);

-- 外键覆盖索引（性能顾问 unindexed_foreign_keys）
create index if not exists comments_author_idx on public.comments (author_id);
create index if not exists comments_parent_idx on public.comments (parent_id);

alter table public.comments enable row level security;

drop policy if exists "comments are viewable by everyone" on public.comments;
create policy "comments are viewable by everyone"
  on public.comments for select using (true);

drop policy if exists "authenticated users can insert own comments" on public.comments;
create policy "authenticated users can insert own comments"
  on public.comments for insert with check ((select auth.uid()) = author_id);

drop policy if exists "users can update own comments" on public.comments;
create policy "users can update own comments"
  on public.comments for update using ((select auth.uid()) = author_id);

drop policy if exists "users can delete own comments" on public.comments;
create policy "users can delete own comments"
  on public.comments for delete using ((select auth.uid()) = author_id);


-- 3. 点赞表 ----------------------------------------------------------------

create table if not exists public.comment_votes (
  comment_id  uuid not null references public.comments(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- 外键覆盖索引（PK 以 comment_id 打头，user_id 方向另建）
create index if not exists comment_votes_user_idx on public.comment_votes (user_id);

alter table public.comment_votes enable row level security;

drop policy if exists "votes are viewable by everyone" on public.comment_votes;
create policy "votes are viewable by everyone"
  on public.comment_votes for select using (true);

drop policy if exists "users can vote" on public.comment_votes;
create policy "users can vote"
  on public.comment_votes for insert with check ((select auth.uid()) = user_id);

drop policy if exists "users can unvote" on public.comment_votes;
create policy "users can unvote"
  on public.comment_votes for delete using ((select auth.uid()) = user_id);


-- 4. 带点赞数 + 作者信息的视图（前端一次查询拿全） ------------------------

create or replace view public.comments_with_meta as
select
  c.*,
  p.username      as author_username,
  p.avatar_url    as author_avatar_url,
  coalesce(v.cnt, 0) as like_count
from public.comments c
join public.profiles p on p.id = c.author_id
left join (
  select comment_id, count(*)::int as cnt
  from public.comment_votes
  group by comment_id
) v on v.comment_id = c.id;

-- 视图继承底表的 RLS（security_invoker），保证读权限一致
alter view public.comments_with_meta set (security_invoker = true);


-- 5.（可选）每个 thread 的评论数，给学习页徽章用 ------------------------

create or replace view public.thread_counts as
select thread_key, count(*)::int as comment_count
from public.comments
group by thread_key;

alter view public.thread_counts set (security_invoker = true);


-- 6. 全站最新评论流（给 /community 首页用，附线索 + 作者） --------------

create or replace view public.recent_comments_with_thread as
select
  c.id,
  c.thread_key,
  c.body,
  c.created_at,
  c.author_id,
  p.username      as author_username,
  p.avatar_url    as author_avatar_url
from public.comments c
join public.profiles p on p.id = c.author_id
order by c.created_at desc;

alter view public.recent_comments_with_thread set (security_invoker = true);


-- 7. 用户贡献统计（给个人主页 + 排行榜用） -------------------------------
-- 注意：用 left join，刚注册没发过言的用户也有一行（comment_count=0）。

create or replace view public.user_contributions as
select
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  p.created_at,
  coalesce(c.comment_count, 0)         as comment_count,
  coalesce(c.last_comment_at, p.created_at) as last_active_at,
  coalesce(l.likes_received, 0)        as likes_received
from public.profiles p
left join (
  select author_id,
         count(*)::int             as comment_count,
         max(created_at)           as last_comment_at
  from public.comments
  group by author_id
) c on c.author_id = p.id
left join (
  select cm.author_id, count(*)::int as likes_received
  from public.comments cm
  join public.comment_votes cv on cv.comment_id = cm.id
  group by cm.author_id
) l on l.author_id = p.id;

alter view public.user_contributions set (security_invoker = true);


-- 8. 单个用户的评论列表（带 thread_key 上下文） --------------------------

create or replace view public.user_comments_with_thread as
select
  c.id,
  c.author_id,
  c.thread_key,
  c.body,
  c.created_at,
  coalesce(v.cnt, 0) as like_count
from public.comments c
left join (
  select comment_id, count(*)::int as cnt
  from public.comment_votes
  group by comment_id
) v on v.comment_id = c.id
order by c.created_at desc;

alter view public.user_comments_with_thread set (security_invoker = true);


-- 9. 付费权益表（一次性买断永久解锁） -----------------------------------
-- 一行 = 一个已付费用户。webhook（用 service_role / secret key）写入，
-- 普通用户只能读自己的那一行，无法自行插入/伪造（没有 insert 策略）。

create table if not exists public.entitlements (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  product           text not null default 'all-access',
  source            text,            -- 'stripe'
  stripe_session_id text,
  created_at        timestamptz not null default now()
);

alter table public.entitlements enable row level security;

drop policy if exists "users can read own entitlement" on public.entitlements;
create policy "users can read own entitlement"
  on public.entitlements for select using ((select auth.uid()) = user_id);

-- 注意：故意不建 insert/update/delete 策略。
-- 只有 service_role（webhook 服务端，绕过 RLS）能写入权益，
-- 前端无论如何都无法自己给自己开通 —— 这是付费墙的安全根基。


-- 10. 头像存储桶（公开读，用户只能传到自己的目录） -----------------------
-- 给「账号设置」页的头像上传用。在 Supabase SQL Editor 跑一次（可重复执行）。
-- 路径约定：<user_id>/avatar.<ext> —— 策略校验首层目录 = 当前用户 id。

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 公开桶:对象 URL 靠 bucket 的 public 标志直接可读,无需宽 SELECT 策略
-- （宽 SELECT 会让客户端列举桶内所有文件）。故意不建;保留 drop 以清掉旧策略。
drop policy if exists "avatar public read" on storage.objects;

drop policy if exists "avatar upload own" on storage.objects;
create policy "avatar upload own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- 11. LVJIN AI 用量计量（按 UTC 天累计 token） -----------------------------
-- 每行 = 某用户某天的 token 总用量。/api/ai/chat 答复前读、答复后用 add_ai_usage 累加。
-- 普通用户只能读自己的；写入只走 service_role / 下面的 security-definer 函数。

create table if not exists public.ai_usage (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day         date not null default (now() at time zone 'utc')::date,
  tokens_used bigint not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

drop policy if exists "users read own ai usage" on public.ai_usage;
create policy "users read own ai usage"
  on public.ai_usage for select using ((select auth.uid()) = user_id);
-- 故意不建 insert/update 策略：只有 service_role 和下面的函数能写。

-- 原子累加（避免读改写竞态）。security definer 让它绕过 RLS 写入。
create or replace function public.add_ai_usage(p_user uuid, p_tokens bigint)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.ai_usage (user_id, day, tokens_used)
  values (p_user, (now() at time zone 'utc')::date, p_tokens)
  on conflict (user_id, day)
  do update set tokens_used = public.ai_usage.tokens_used + excluded.tokens_used;
$$;


-- 12. AI 额外配额积分（按量另付，购买的 token 不过期） ----------------------
-- 当日含量用尽后从这里扣。webhook（service_role）用 add_ai_credits 充值，
-- /api/ai/chat 用 spend_ai_credits 扣减。普通用户只读自己的余额。

create table if not exists public.ai_credits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance bigint not null default 0
);

alter table public.ai_credits enable row level security;

drop policy if exists "users read own ai credits" on public.ai_credits;
create policy "users read own ai credits"
  on public.ai_credits for select using ((select auth.uid()) = user_id);
-- 故意不建 insert/update 策略：只有 service_role 和下面的函数能写。

-- 充值（Stripe webhook 调用）。
create or replace function public.add_ai_credits(p_user uuid, p_tokens bigint)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.ai_credits (user_id, balance)
  values (p_user, p_tokens)
  on conflict (user_id)
  do update set balance = public.ai_credits.balance + excluded.balance;
$$;

-- 扣减（答复后调用），floor 到 0，避免负数。
create or replace function public.spend_ai_credits(p_user uuid, p_tokens bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_credits
  set balance = greatest(0, balance - p_tokens)
  where user_id = p_user;
$$;

-- ── 安全:把上面这些 SECURITY DEFINER 辅助函数锁给服务端(service_role)专用 ──
-- 否则 PostgREST 会把它们暴露成 anon/authenticated 可调的 RPC(可白嫖 AI 额度 /
-- 篡改任意用户用量)。Supabase 默认会把 EXECUTE 直接授给 anon/authenticated,
-- 所以必须显式从这两个角色 revoke,而不仅是从 public。
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.add_ai_usage(uuid, bigint) from public, anon, authenticated;
revoke execute on function public.add_ai_credits(uuid, bigint) from public, anon, authenticated;
revoke execute on function public.spend_ai_credits(uuid, bigint) from public, anon, authenticated;
grant execute on function public.add_ai_usage(uuid, bigint) to service_role;
grant execute on function public.add_ai_credits(uuid, bigint) to service_role;
grant execute on function public.spend_ai_credits(uuid, bigint) to service_role;


-- 13. LVJIN AI 多会话历史（像 ChatGPT/Claude：可保存多段对话、随时回看） --------
-- ai_conversations = 一段对话；ai_messages = 其中的每条消息。
-- 全部受 RLS 保护：用户只能读写自己的对话与消息。客户端用 anon key 直接增删查，
-- /api/ai/chat 仍只负责生成与计量，消息持久化交给前端（带用户会话，RLS 兜底）。

create table if not exists public.ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default '新对话',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ai_conversations_user_idx
  on public.ai_conversations (user_id, updated_at desc);

alter table public.ai_conversations enable row level security;

drop policy if exists "users manage own conversations" on public.ai_conversations;
create policy "users manage own conversations"
  on public.ai_conversations for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  model           text,
  created_at      timestamptz not null default now()
);

create index if not exists ai_messages_conversation_idx
  on public.ai_messages (conversation_id, created_at);

-- 外键覆盖索引（性能顾问 unindexed_foreign_keys）
create index if not exists ai_messages_user_idx on public.ai_messages (user_id);

alter table public.ai_messages enable row level security;

drop policy if exists "users manage own messages" on public.ai_messages;
create policy "users manage own messages"
  on public.ai_messages for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);


-- 14. 电子学习伴侣开关（仅 Plus 可用，用户自行开启） ----------------------------
-- 默认关闭。Plus 用户在「账号设置」里开启后，伴侣才在全站浮现。
-- 复用 profiles 的「users can update own profile」更新策略，无需新策略。

alter table public.profiles
  add column if not exists companion_enabled boolean not null default false;
