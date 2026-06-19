import { redirect } from 'next/navigation'

/**
 * The old keyword-search 助手 has been replaced by LVJIN AI at /ai.
 * Kept as a permanent redirect so old links / bookmarks don't 404.
 */
export default function AssistantRedirect() {
  redirect('/ai')
}
