import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { AppEnv, Env } from './env'
import { requireUser } from './supabase'

export interface EmailMessage {
  to: string
  subject: string
  html: string
}

// Use from your own /api routes. Never expose a route that lets a client pick
// an arbitrary recipient: that turns the app into a spam relay.
export async function sendEmail(env: Env, message: EmailMessage) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new HTTPException(503, {
      message: 'Email is not set up yet. Add RESEND_API_KEY and EMAIL_FROM in Lovabee Cloud settings.',
    })
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM, ...message }),
  })
  if (!res.ok) throw new HTTPException(502, { message: `Email provider rejected the message (${res.status})` })
}

export const emailRoutes = new Hono<AppEnv>().post('/test', requireUser, async (c) => {
  const user = c.get('user')
  if (!user.email) throw new HTTPException(400, { message: 'Your account has no email address' })
  await sendEmail(c.env, {
    to: user.email,
    subject: 'Email is working',
    html: '<p>This test email confirms your app can send email.</p>',
  })
  return c.json({ sent: true })
})
