'use client'

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/**
 * The single account permitted to use the admin area.
 * Enforced at the database (RLS whitelists this user's uid) — this module is UX.
 */
export const ADMIN_EMAIL = 'cryptosi@protonmail.com'

/**
 * Returns the current Supabase session ONLY if the signed-in user is the
 * whitelisted admin. Any other logged-in user is treated as not authed.
 */
export function useAdminSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }: any) => {
      const email = data?.session?.user?.email?.toLowerCase()
      setSession(email === ADMIN_EMAIL ? data.session : null)
      setLoading(false)
    })

    const { data: sub }: any = supabase.auth.onAuthStateChange((_event: any, s: any) => {
      const email = s?.user?.email?.toLowerCase()
      setSession(email === ADMIN_EMAIL ? s : null)
    })

    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  return { session, loading }
}
