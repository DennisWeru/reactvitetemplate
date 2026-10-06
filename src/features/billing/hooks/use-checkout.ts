import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../../../shared/lib/api'

export function useCheckout() {
  return useMutation({
    mutationFn: (priceId: string) =>
      apiFetch<{ url: string }>('/billing/checkout', { method: 'POST', body: JSON.stringify({ priceId }) }),
    onSuccess: ({ url }) => window.location.assign(url),
  })
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: () => apiFetch<{ url: string }>('/billing/portal', { method: 'POST' }),
    onSuccess: ({ url }) => window.location.assign(url),
  })
}
