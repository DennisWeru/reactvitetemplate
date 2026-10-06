import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../shared/lib/supabase'

const LIVE_STATUSES = ['active', 'trialing', 'past_due']

// RLS already limits rows to the signed-in user, so no user filter is needed.
export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .in('status', LIVE_STATUSES)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
