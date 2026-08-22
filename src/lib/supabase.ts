import { createClient } from '@supabase/supabase-js'

// Re-export all types for convenience
export * from './types';

// Re-export player utilities for convenience
export {
  calculatePlayerAge,
  isValidPlayerAge,
  getAgeValidationError,
  playerRegistrationSchema,
  validatePlayerRegistration,
  validateField,
  type PlayerRegistrationForm,
  type AgeCalculation,
  type CreatePlayerApplication,
  type UpdatePlayerApplication,
  type PlayerApplicationFormData
} from './player-utils';

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
