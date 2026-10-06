import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv } from './env'
import { billingRoutes, webhookRoutes } from './billing'
import { emailRoutes } from './email'

export const app = new Hono<AppEnv>().basePath('/api')

app.get('/health', (c) => c.json({ ok: true }))
app.route('/billing', billingRoutes)
app.route('/webhooks', webhookRoutes)
app.route('/email', emailRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status)
  console.error(err)
  return c.json({ error: 'Something went wrong' }, 500)
})
