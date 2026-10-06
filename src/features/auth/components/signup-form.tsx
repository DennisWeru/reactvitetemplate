import React, { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../shared/components/ui/button'
import { supabase } from '../../../shared/lib/supabase'
import { authRedirectUrl } from '../hooks/use-auth'
import { AuthCard, Field, FormMessage } from './auth-card'

export function SignupForm() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: authRedirectUrl('/account') },
    })
    setSubmitting(false)
    if (signUpError) return setError(signUpError.message)
    // With email confirmation on (the Supabase default) there is no session
    // until the user clicks the link in their inbox.
    if (data.session) navigate('/account', { replace: true })
    else setCheckEmail(true)
  }

  if (checkEmail) {
    return (
      <AuthCard title="Check your email" description={`We sent a confirmation link to ${email}.`}>
        <Link to="/login" className="text-sm font-medium text-slate-900 hover:underline">
          Back to sign in
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <FormMessage tone="error">{error}</FormMessage>}
        <Field
          id="full-name"
          label="Full name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
