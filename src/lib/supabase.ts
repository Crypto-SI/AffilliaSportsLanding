import { createClient } from '@supabase/supabase-js'

// Database types for the existing mailing list
export interface MailingListEntry {
  id?: number
  name: string
  email: string
  phone?: string | null
  created_at?: string
}

// Database types for player applications
export interface PlayerApplication {
  id?: string
  name: string
  email: string
  phone: string | null
  position: string
  experience_level: string
  application_notes: string | null
  cv_file_path: string | null
  created_at?: string
  updated_at?: string
}

// Database types for AI Scout interviews
export interface AIScoutInterview {
  id?: string
  prospect_name: string
  prospect_email?: string | null
  prospect_phone?: string | null
  prospect_age?: number | null
  prospect_position?: string | null
  interview_status: 'in_progress' | 'completed' | 'abandoned'
  interview_duration_minutes?: number | null
  conversation_file_path?: string | null
  ai_recommendation_text?: string | null
  ai_recommendation_score?: number | null
  ai_recommendation_tags?: string[] | null
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

// Database types for AI Scout conversation messages
export interface AIScoutConversation {
  id?: string
  interview_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  metadata?: Record<string, any>
}

// Database types for contact messages
export interface ContactMessage {
  id?: string
  name: string
  email: string
  subject?: string | null
  message: string
  phone?: string | null
  created_at?: string
  updated_at?: string
}

// Ensure we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a fallback client that doesn't cause hanging
let supabaseClient: any = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url-here' && supabaseAnonKey !== 'your-supabase-anon-key-here') {
  try {
    // Create Supabase client with proper configuration
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'affillia-sports-landing',
        },
      },
    });
    isSupabaseConfigured = true;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    isSupabaseConfigured = false;
  }
} else {
  console.warn('Supabase environment variables not configured. Using mock client.');
  isSupabaseConfigured = false;
}

// Create a mock client that prevents hanging
const mockSupabaseClient = {
  from: () => ({
    insert: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    select: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    update: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    delete: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    single: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: 'Supabase storage not configured' }),
      download: () => Promise.resolve({ data: null, error: 'Supabase storage not configured' }),
    }),
  },
};

// Export the configured client or mock client
export const supabase = supabaseClient || mockSupabaseClient;
export { isSupabaseConfigured };

// Utility function to handle Supabase operations with timeout
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

// Enhanced error handling for Supabase operations
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  // Handle specific error types
  if (error?.message?.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.'
  }
  
  if (error?.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.'
  }
  
  if (error?.code === 'PGRST116') {
    return 'Database connection error. Please try again later.'
  }
  
  // Return a user-friendly error message
  return error?.message || 'An unexpected error occurred. Please try again.'
}

// Safe operation wrapper with timeout
export async function safeSupabaseOperation<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 15000
): Promise<T> {
  if (!isSupabaseConfigured) {
    return Promise.resolve({ data: null, error: 'Supabase not configured' } as T);
  }

  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

// Test connection function
export async function testSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const result = await safeSupabaseOperation(
      () => supabase.from('player_applications').select('count', { count: 'exact' }),
      5000
    );
    return !(result as any).error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
} 