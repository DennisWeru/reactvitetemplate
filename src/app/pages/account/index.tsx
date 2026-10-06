import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../shared/components/ui/button'
import { AuthGuard, useAuth, useSignOut } from '../../../features/auth'
import { BillingPortalButton, useSubscription } from '../../../features/billing'

function AccountDetails() {
  const { user } = useAuth()
  const signOut = useSignOut()
  const subscription = useSubscription()

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Your account</h1>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
      <dl className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200">
        <div className="flex justify-between px-4 py-3 text-sm">
          <dt className="text-slate-500">Email</dt>
          <dd className="text-slate-900">{user?.email}</dd>
        </div>
        <div className="flex justify-between px-4 py-3 text-sm">
          <dt className="text-slate-500">Plan</dt>
          <dd className="text-slate-900">
            {subscription.isLoading ? '…' : subscription.data ? subscription.data.status : 'Free'}
          </dd>
        </div>
      </dl>
      {subscription.data && (
        <div className="mt-6">
          <BillingPortalButton />
        </div>
      )}
      <Link to="/" className="mt-8 inline-block text-sm text-slate-500 hover:text-slate-900">
        ← Back home
      </Link>
    </div>
  )
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountDetails />
    </AuthGuard>
  )
}
