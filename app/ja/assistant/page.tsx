import { redirect } from 'next/navigation'

/**
 * The old keyword-search assistant has been replaced by LVJIN AI at /ja/ai.
 * Kept as a permanent redirect so old links / bookmarks don't 404.
 */
export default function AssistantRedirectJa() {
  redirect('/ja/ai')
}
