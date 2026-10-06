import type { User } from '@supabase/supabase-js'

// Lovabee sets SUPABASE_* and APP_URL. Everything else comes from the secrets
// the user adds in Lovabee Cloud settings; locally they are read from .dev.vars.
export interface Env {
  SUPABASE_URL: string
  SUPABASE_PUBLISHABLE_KEY: string
  SUPABASE_SECRET_KEY: string
  APP_URL?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
}

export type AppEnv = {
  Bindings: Env
  Variables: { user: User }
}
