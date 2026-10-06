import { createClient } from '@supabase/supabase-js'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { Database } from '../../src/shared/types/database'
import type { AppEnv, Env } from './env'

// Bypasses RLS. Only use it for work the signed-in user can't do themselves
// (webhooks, writes to service-only tables), and always scope by user id.
export function createAdminClient(env: Env) {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) throw new HTTPException(401, { message: 'Sign in required' })

  const { data, error } = await createAdminClient(c.env).auth.getUser(token)
  if (error || !data.user) throw new HTTPException(401, { message: 'Session expired, sign in again' })

  c.set('user', data.user)
  await next()
})

export function appUrl(env: Env, requestUrl: string) {
  return (env.APP_URL || new URL(requestUrl).origin).replace(/\/$/, '')
}
