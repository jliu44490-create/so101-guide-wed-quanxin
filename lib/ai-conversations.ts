'use client'

/**
 * Client-side persistence for LVJIN AI chat history.
 *
 * Conversations + messages live in Supabase (tables ai_conversations /
 * ai_messages, see schema.sql §13) and are read/written directly from the
 * browser with the user's own session — RLS guarantees a user only ever
 * touches their own rows. The /api/ai/chat route stays focused on generation
 * + token metering; the /ai page owns saving the turns it produces.
 *
 * Everything degrades gracefully when Supabase isn't configured (returns empty
 * / null) so the page never crashes on a half-set-up deploy.
 */

import { supabase } from './supabase'

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  model: string | null
  created_at: string
}

/** Derive a short conversation title from the first user question. */
export function titleFromText(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t) return '新对话'
  return t.length > 28 ? `${t.slice(0, 28)}…` : t
}

/** Most-recent-first list of the current user's conversations. */
export async function listConversations(userId: string): Promise<Conversation[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(100)
  if (error) return []
  return (data as Conversation[]) ?? []
}

/** All messages in a conversation, oldest first. */
export async function loadMessages(conversationId: string): Promise<StoredMessage[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, model, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) return []
  return (data as StoredMessage[]) ?? []
}

/** Create a fresh conversation; returns its id (or null if backend is absent). */
export async function createConversation(userId: string, title: string): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, title: titleFromText(title) })
    .select('id')
    .single()
  if (error || !data) return null
  return (data as { id: string }).id
}

/** Append one message to a conversation and bump its updated_at. */
export async function saveMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  model?: string | null
): Promise<void> {
  if (!supabase || !content.trim()) return
  await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
    model: model ?? null
  })
  // Surface freshly-active conversations at the top of the sidebar.
  await supabase
    .from('ai_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
}

export async function renameConversation(conversationId: string, title: string): Promise<void> {
  if (!supabase) return
  await supabase
    .from('ai_conversations')
    .update({ title: titleFromText(title) })
    .eq('id', conversationId)
}

export async function deleteConversation(conversationId: string): Promise<void> {
  if (!supabase) return
  // ai_messages cascade-delete via FK.
  await supabase.from('ai_conversations').delete().eq('id', conversationId)
}
