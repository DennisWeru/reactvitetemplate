import React, { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/ui/button'
import { supabase } from '../../../shared/lib/supabase'
import { useAuth } from '../hooks/use-auth'
import { AuthCard, Field, FormMessage } from './auth-card'

// Reached from the reset email: Supabase signs the user in from the link, so
// there is a session here and updateUser can set the new password.
export function ResetPasswordForm() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) return setError(updateError.message)
    navigate('/account', { replace: true })
  }

  if (!loading && !user) {
    return <AuthCard title="Link expired" description="This reset link is invalid or has expired. Request a new one." />
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <Field
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={submitting || loading}>
          {submitting ? 'Saving…' : 'Save password'}
        </Button>
      </form>
    </AuthCard>
  )
}
