/**
 * CloudBase cloud function: community
 * ----------------------------------------------------------------------------
 * Powers the CN region's community data (comments / votes / profiles /
 * entitlement). The browser calls it via app.callFunction({ name: 'community',
 * data: { action, ... } }); permissions are enforced HERE using the caller's
 * authenticated uid (never trusting client-supplied ids for writes).
 *
 * It connects to the env's PostgreSQL over the internal VPC address using `pg`.
 * Configure these env vars on the function at deploy time:
 *   PGHOST     内网地址，如 172.17.0.8
 *   PGPORT     5432
 *   PGUSER     数据库账号（如 AMJLTA）
 *   PGPASSWORD 数据库密码
 *   PGDATABASE postgres
 *
 * Tables come from cloudbase/schema.sql (already created).
 */

const cloudbase = require('@cloudbase/node-sdk')
const { Pool } = require('pg')

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV })

// Reuse the pool across warm invocations.
let pool
function db() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'postgres',
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000
    })
  }
  return pool
}

/** The authenticated caller's uid, or null when the call is anonymous. */
function callerUid() {
  try {
    const info = app.auth().getUserInfo()
    return (info && (info.customUserId || info.uid || info.openId)) || null
  } catch (e) {
    return null
  }
}

const ok = (data) => ({ data, error: null })
const fail = (error) => ({ data: null, error })

// Make sure a profile row exists for this user (CloudBase has no Supabase-style
// trigger). Username defaults to user_<8> and can be edited later.
async function ensureProfile(uid, hint) {
  const username = (hint && String(hint).trim()) || `user_${String(uid).slice(0, 8)}`
  await db().query(
    `insert into profiles (id, username)
       values ($1, $2)
       on conflict (id) do nothing`,
    [uid, username]
  )
}

async function listThread(event, uid) {
  const threadKey = String(event.threadKey || '')
  if (!threadKey) return fail('missing_thread_key')

  const { rows } = await db().query(
    `select c.id, c.thread_key, c.author_id, c.body, c.parent_id,
            c.created_at, c.updated_at,
            p.username   as author_username,
            p.avatar_url as author_avatar_url,
            coalesce(v.cnt, 0)::int as like_count
       from comments c
       join profiles p on p.id = c.author_id
       left join (
         select comment_id, count(*) as cnt
           from comment_votes group by comment_id
       ) v on v.comment_id = c.id
      where c.thread_key = $1
      order by c.created_at asc`,
    [threadKey]
  )

  let likedIds = []
  if (uid && rows.length > 0) {
    const ids = rows.map((r) => r.id)
    const liked = await db().query(
      `select comment_id from comment_votes
        where user_id = $1 and comment_id = any($2::uuid[])`,
      [uid, ids]
    )
    likedIds = liked.rows.map((r) => r.comment_id)
  }
  return ok({ comments: rows, likedIds })
}

async function postComment(event, uid) {
  const threadKey = String(event.threadKey || '')
  const body = String(event.body || '').trim()
  if (!threadKey) return fail('missing_thread_key')
  if (body.length < 1 || body.length > 5000) return fail('invalid_body')

  await ensureProfile(uid, event.username)
  await db().query(
    `insert into comments (thread_key, author_id, body) values ($1, $2, $3)`,
    [threadKey, uid, body]
  )
  return ok({})
}

async function deleteComment(event, uid) {
  const commentId = String(event.commentId || '')
  if (!commentId) return fail('missing_comment_id')
  // Ownership enforced in the WHERE clause.
  const { rowCount } = await db().query(
    `delete from comments where id = $1 and author_id = $2`,
    [commentId, uid]
  )
  if (rowCount === 0) return fail('not_found_or_forbidden')
  return ok({})
}

async function setLike(event, uid) {
  const commentId = String(event.commentId || '')
  const liked = !!event.liked
  if (!commentId) return fail('missing_comment_id')

  await ensureProfile(uid, event.username)
  if (liked) {
    await db().query(
      `insert into comment_votes (comment_id, user_id) values ($1, $2)
         on conflict (comment_id, user_id) do nothing`,
      [commentId, uid]
    )
  } else {
    await db().query(
      `delete from comment_votes where comment_id = $1 and user_id = $2`,
      [commentId, uid]
    )
  }
  return ok({})
}

async function getProfile(event) {
  const userId = String(event.userId || '')
  if (!userId) return fail('missing_user_id')
  const { rows } = await db().query(
    `select id, username, avatar_url, bio, created_at from profiles where id = $1`,
    [userId]
  )
  return ok({ profile: rows[0] || null })
}

async function getEntitlement(uid) {
  if (!uid) return ok({ hasEntitlement: false })
  const { rows } = await db().query(
    `select user_id from entitlements where user_id = $1`,
    [uid]
  )
  return ok({ hasEntitlement: rows.length > 0 })
}

exports.main = async (event = {}, context) => {
  const action = event.action
  const uid = callerUid()
  const needsAuth = ['postComment', 'deleteComment', 'setLike'].includes(action)
  if (needsAuth && !uid) return fail('not_authenticated')

  try {
    switch (action) {
      case 'listThread':
        return await listThread(event, uid)
      case 'postComment':
        return await postComment(event, uid)
      case 'deleteComment':
        return await deleteComment(event, uid)
      case 'setLike':
        return await setLike(event, uid)
      case 'getProfile':
        return await getProfile(event)
      case 'getEntitlement':
        return await getEntitlement(uid)
      default:
        return fail('unknown_action')
    }
  } catch (e) {
    return fail((e && e.message) || String(e))
  }
}
