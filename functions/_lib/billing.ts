import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import Stripe from 'stripe'
import type { AppEnv, Env } from './env'
import { appUrl, createAdminClient, requireUser } from './supabase'

function stripeFor(env: Env) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HTTPException(503, {
      message: 'Payments are not set up yet. Add STRIPE_SECRET_KEY in Lovabee Cloud settings.',
    })
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })
}

async function getOrCreateCustomer(env: Env, stripe: Stripe, userId: string, email: string | undefined) {
  const admin = createAdminClient(env)
  const { data: existing } = await admin
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()
  if (existing) return existing.stripe_customer_id

  const customer = await stripe.customers.create({ email, metadata: { user_id: userId } })
  const { error } = await admin.from('customers').insert({ user_id: userId, stripe_customer_id: customer.id })
  if (error) throw new HTTPException(500, { message: 'Could not save the billing customer' })
  return customer.id
}

export const billingRoutes = new Hono<AppEnv>()
  .post('/checkout', requireUser, async (c) => {
    const { priceId } = await c.req.json<{ priceId?: string }>()
    if (!priceId) throw new HTTPException(400, { message: 'priceId is required' })

    const stripe = stripeFor(c.env)
    const user = c.get('user')
    const price = await stripe.prices.retrieve(priceId)
    const customer = await getOrCreateCustomer(c.env, stripe, user.id, user.email)
    const base = appUrl(c.env, c.req.url)

    const session = await stripe.checkout.sessions.create({
      mode: price.recurring ? 'subscription' : 'payment',
      customer,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/account?checkout=success`,
      cancel_url: `${base}/account?checkout=cancelled`,
      ...(price.recurring ? { subscription_data: { metadata: { user_id: user.id } } } : {}),
    })
    if (!session.url) throw new HTTPException(502, { message: 'Stripe did not return a checkout URL' })
    return c.json({ url: session.url })
  })
  .post('/portal', requireUser, async (c) => {
    const stripe = stripeFor(c.env)
    const { data: customer } = await createAdminClient(c.env)
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', c.get('user').id)
      .maybeSingle()
    if (!customer) throw new HTTPException(404, { message: 'No billing account yet' })

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${appUrl(c.env, c.req.url)}/account`,
    })
    return c.json({ url: session.url })
  })

async function syncSubscription(env: Env, subscription: Stripe.Subscription) {
  const admin = createAdminClient(env)
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  let userId = subscription.metadata.user_id
  if (!userId) {
    const { data } = await admin.from('customers').select('user_id').eq('stripe_customer_id', customerId).maybeSingle()
    userId = data?.user_id ?? ''
  }
  if (!userId) throw new Error(`No user for Stripe customer ${customerId}`)

  const item = subscription.items.data[0]
  const { error } = await admin.from('subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: item?.price.id ?? null,
    current_period_end: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  })
  if (error) throw new Error(`Could not save subscription: ${error.message}`)
}

export const webhookRoutes = new Hono<AppEnv>().post('/stripe', async (c) => {
  const stripe = stripeFor(c.env)
  if (!c.env.STRIPE_WEBHOOK_SECRET) throw new HTTPException(503, { message: 'STRIPE_WEBHOOK_SECRET is not set' })

  const signature = c.req.header('stripe-signature')
  if (!signature) throw new HTTPException(400, { message: 'Missing stripe-signature header' })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      await c.req.text(),
      signature,
      c.env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch {
    throw new HTTPException(400, { message: 'Invalid Stripe signature' })
  }

  const admin = createAdminClient(c.env)
  const { data: seen } = await admin.from('stripe_events').select('id').eq('id', event.id).maybeSingle()
  if (seen) return c.json({ received: true, duplicate: true })

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(c.env, event.data.object)
      break
    default:
      break
  }

  // Recorded only after handling succeeds, so a failed attempt is retried by Stripe.
  await admin.from('stripe_events').insert({ id: event.id, type: event.type })
  return c.json({ received: true })
})
