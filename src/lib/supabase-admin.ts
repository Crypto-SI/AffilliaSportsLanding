import { createClient } from '@supabase/supabase-js'

/**
 * SERVER-ONLY Supabase client using the service role key.
 * Bypasses RLS — must never be imported into client components.
 * Used by API routes that perform privileged operations (form inserts,
 * duplicate checks) so the anon key needs no write/read grants at all.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin: any = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

export const isAdminConfigured = Boolean(supabaseUrl && serviceKey)
