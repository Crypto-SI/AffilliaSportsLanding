import { z } from 'zod';
import type { PlayerApplication } from './types';

// Age calculation interface
export interface AgeCalculation {
  age: number;
  isYouth: boolean; // under 18
  contactGuidance: string;
  validationRules: {
    requiresParentConsent: boolean;
    contactFieldLabel: string;
    contactFieldPlaceholder: string;
    phoneFieldLabel: string;
    phoneFieldPlaceholder: string;
  };
}

/**
 * Calculate player age and return age-based configuration
 * @param dateOfBirth - Date object or ISO date string
 * @returns AgeCalculation object with age and UI configuration
 */
export const calculatePlayerAge = (dateOfBirth: Date | string): AgeCalculation => {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  // Calculate age accounting for birthday this year
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const isYouth = age < 18;
  
  return {
    age,
    isYouth,
    contactGuidance: isYouth 
      ? 'Parent/guardian contact information required for players under 18. This ensures proper consent and communication for youth players.'
      : 'Your contact information',
    validationRules: {
      requiresParentConsent: isYouth,
      contactFieldLabel: isYouth ? 'Parent/Guardian Email' : 'Email',
      contactFieldPlaceholder: isYouth ? 'parent@example.com' : 'your@example.com',
      phoneFieldLabel: isYouth ? 'Parent/Guardian Phone' : 'Phone',
      phoneFieldPlaceholder: isYouth ? 'Parent/guardian phone number' : 'Your phone number'
    }
  };
};

/**
 * Validate if a date of birth is reasonable for a player
 * @param dateOfBirth - Date object or ISO date string
 * @returns boolean indicating if the age is within reasonable bounds
 */
export const isValidPlayerAge = (dateOfBirth: Date | string): boolean => {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  // Check if date is in the future
  if (birthDate > today) {
    return false;
  }
  
  const age = calculatePlayerAge(birthDate).age;
  
  // Reasonable age range for players (5-65 years)
  return age >= 5 && age <= 65;
};

/**
 * Get age-appropriate validation error message with specific details
 * @param dateOfBirth - Date object or ISO date string
 * @returns string with appropriate error message
 */
export const getAgeValidationError = (dateOfBirth: Date | string): string => {
  const dateString = typeof dateOfBirth === 'string' ? dateOfBirth : dateOfBirth.toISOString().split('T')[0];
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  // Check if date is invalid
  if (isNaN(birthDate.getTime())) {
    return 'Please enter a valid date in YYYY-MM-DD format (e.g., 1995-06-15)';
  }
  
  // Check for unrealistic dates (like February 30th) BEFORE other validations
  if (typeof dateOfBirth === 'string') {
    const parts = dateOfBirth.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      
      // Create a date and check if it matches the input
      const reconstructedDate = new Date(year, month - 1, day);
      if (reconstructedDate.getFullYear() !== year || 
          reconstructedDate.getMonth() !== month - 1 || 
          reconstructedDate.getDate() !== day) {
        return 'Please enter a valid calendar date (this date does not exist)';
      }
    }
  }
  
  // Check if date is in the future
  if (birthDate > today) {
    const daysDiff = Math.ceil((birthDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return `Date of birth cannot be ${daysDiff} day${daysDiff > 1 ? 's' : ''} in the future`;
  }
  
  // Check if date is too far in the past.
  // Compare at calendar-day granularity: a date exactly 100 years ago is valid
  // (falls through to age checks); only dates MORE than 100 years old are rejected.
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(today.getFullYear() - 100);
  hundredYearsAgo.setHours(0, 0, 0, 0);
  if (birthDate < hundredYearsAgo) {
    return 'Please enter a date of birth within the last 100 years';
  }

  const age = calculatePlayerAge(birthDate).age;
  
  if (age < 5) {
    return `Player is ${age} years old, but must be at least 5 years old to register. For younger players, please contact us directly.`;
  }
  
  if (age > 65) {
    return `For players over 65 years old, please contact us directly for specialized registration assistance.`;
  }
  
  return 'Please enter a valid date of birth';
};

// Form validation schema using Zod
export const playerRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .nullable()
    .refine((phone) => {
      // Allow null or empty string (optional field)
      if (!phone || phone.trim() === '') return true;
      // Validate format if provided
      return /^\+?[\d\s\-\(\)\.]+$/.test(phone);
    }, 'Please enter a valid phone number')
    .refine((phone) => {
      // Allow null or empty string (optional field)
      if (!phone || phone.trim() === '') return true;
      // Check minimum length if provided
      const digitsOnly = phone.replace(/\D/g, '');
      return digitsOnly.length >= 10;
    }, 'Phone number must be at least 10 digits')
    .refine((phone) => {
      // Allow null or empty string (optional field)
      if (!phone || phone.trim() === '') return true;
      // Check maximum length if provided
      return phone.length <= 20;
    }, 'Phone number must be less than 20 characters'),
  
  date_of_birth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      return !isNaN(birthDate.getTime());
    }, 'Please enter a valid date')
    .refine((date) => {
      return isValidPlayerAge(date);
    }, 'Please enter a valid date of birth (age must be between 5 and 65 years)'),
  
  position: z.string()
    .min(1, 'Please select a position')
    .max(50, 'Position must be less than 50 characters'),
  
  experience_level: z.string()
    .min(1, 'Please select experience level')
    .max(50, 'Experience level must be less than 50 characters'),
  
  application_notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional(),
  
  cv_file_path: z.string()
    .nullable()
    .optional()
});

// Type inference from the schema
export type PlayerRegistrationForm = z.infer<typeof playerRegistrationSchema>;

// Type for creating new player applications (without auto-generated fields)
export type CreatePlayerApplication = Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'>;

// Type for updating existing player applications
export type UpdatePlayerApplication = Partial<Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'>>;

// Type for form submission data (matches the Zod schema)
export type PlayerApplicationFormData = PlayerRegistrationForm;

// Validation function for the entire form
export const validatePlayerRegistration = (data: unknown): { 
  success: boolean; 
  data?: PlayerRegistrationForm; 
  errors?: Record<string, string> 
} => {
  try {
    const validatedData = playerRegistrationSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Helper function to get field-specific validation
export const validateField = (fieldName: keyof PlayerRegistrationForm, value: unknown): {
  isValid: boolean;
  error?: string;
} => {
  try {
    const fieldSchema = playerRegistrationSchema.shape[fieldName];
    fieldSchema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};