import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.supabase.cryptosi.org'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.4T9S9STozL1W4ktzHOJbVEyJAXkkN1DHM6RFWbwim9g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for the Affillia mailing list
export interface MailingListEntry {
  id?: number
  name: string
  email: string
  phone?: string | null
  created_at?: string
} 