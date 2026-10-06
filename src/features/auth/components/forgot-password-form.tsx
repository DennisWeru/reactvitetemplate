import React, { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/ui/button'
import { supabase } from '../../../shared/lib/supabase'
import { authRedirectUrl } from '../hooks/use-auth'
import { AuthCard, Field, FormMessage } from './auth-card'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl('/reset-password'),
    })
    setSubmitting(false)
    if (resetError) return setError(resetError.message)
    setSent(true)
  }

  return (
    <AuthCard
      title="Reset your password"
      description="We'll email you a link to choose a new password."
      footer={
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <FormMessage tone="success">If an account exists for {email}, a reset link is on its way.</FormMessage>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <FormMessage tone="error">{error}</FormMessage>}
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
