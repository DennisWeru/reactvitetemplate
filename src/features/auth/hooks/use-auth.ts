import { useCallback, useContext } from 'react'
import { supabase } from '../../../shared/lib/supabase'
import { AuthContext } from '../providers/auth-provider'

export function useAuth() {
  return useContext(AuthContext)
}

export function useSignOut() {
  return useCallback(() => supabase.auth.signOut(), [])
}

// Where Supabase should send users back to after email links (confirm
// signup, password reset). Must be listed in the project's auth redirect URLs,
// which Lovabee keeps in sync with the preview and deployed domains.
export function authRedirectUrl(path: string) {
  return `${window.location.origin}${path}`
}
