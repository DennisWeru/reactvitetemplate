import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && publishableKey)

// createClient throws on an empty URL, which would blank the whole app before
// Cloud is connected; the placeholder keeps the UI rendering and every call
// fails with a network error instead.
export const supabase = createClient<Database>(
  url || 'https://not-configured.supabase.co',
  publishableKey || 'not-configured',
)
