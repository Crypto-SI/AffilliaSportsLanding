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
  date_of_birth: string // ISO date string format
  position: string
  experience_level: string
  application_notes: string | null
  cv_file_path: string | null
  created_at?: string
  updated_at?: string
}

// Legacy interface for backward compatibility during migration
export interface LegacyPlayerApplicationData {
  name: string
  email: string
  phone: string | null
  position: string
  experience_level: string
  application_notes: string | null
  cv_file_path: string | null
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