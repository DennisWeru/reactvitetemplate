import React, { PropsWithChildren } from 'react'
import { Button, ButtonProps } from '../../../shared/components/ui/button'
import { useBillingPortal, useCheckout } from '../hooks/use-checkout'

interface CheckoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  priceId: string
}

// priceId is a Stripe Price id (price_...) from the user's Stripe dashboard.
export function CheckoutButton({ priceId, children, ...props }: PropsWithChildren<CheckoutButtonProps>) {
  const checkout = useCheckout()
  return (
    <div>
      <Button {...props} disabled={checkout.isLoading || props.disabled} onClick={() => checkout.mutate(priceId)}>
        {checkout.isLoading ? 'Redirecting…' : children}
      </Button>
      {checkout.error instanceof Error && <p className="mt-2 text-sm text-red-600">{checkout.error.message}</p>}
    </div>
  )
}

export function BillingPortalButton({ children, ...props }: PropsWithChildren<Omit<ButtonProps, 'onClick'>>) {
  const portal = useBillingPortal()
  return (
    <div>
      <Button
        variant="outline"
        {...props}
        disabled={portal.isLoading || props.disabled}
        onClick={() => portal.mutate()}
      >
        {portal.isLoading ? 'Opening…' : children ?? 'Manage billing'}
      </Button>
      {portal.error instanceof Error && <p className="mt-2 text-sm text-red-600">{portal.error.message}</p>}
    </div>
  )
}
