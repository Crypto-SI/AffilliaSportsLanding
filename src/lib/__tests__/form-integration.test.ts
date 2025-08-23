import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validatePlayerRegistration, calculatePlayerAge } from '../player-utils';
import type { PlayerApplication } from '../types';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Form Integration Tests with Date of Birth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-08-22'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Complete Form Submission Flow - Requirements 1.2, 2.2, 3.3', () => {
    it('should handle complete adult player registration flow', async () => {
      const adultFormData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        dateOfBirth: '1995-06-15', // 29 years old
        position: 'midfielder',
        experienceLevel: 'professional',
        applicationNotes: 'Experienced player looking for new opportunities',
        cvFile: null
      };

      // Simulate form data transformation (camelCase to snake_case)
      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: adultFormData.name.trim(),
        email: adultFormData.email.trim().toLowerCase(),
        phone: adultFormData.phone.trim(),
        date_of_birth: adultFormData.dateOfBirth,
        position: adultFormData.position,
        experience_level: adultFormData.experienceLevel,
        application_notes: adultFormData.applicationNotes.trim(),
        cv_file_path: null
      };

      // Validate the transformed data
      const validation = validatePlayerRegistration(applicationData);
      expect(validation.success).toBe(true);
      expect(validation.data).toBeDefined();

      // Verify age calculation for UI logic
      const ageInfo = calculatePlayerAge(adultFormData.dateOfBirth);
      expect(ageInfo.age).toBe(29);
      expect(ageInfo.isYouth).toBe(false);
      expect(ageInfo.validationRules.contactFieldLabel).toBe('Email');
      expect(ageInfo.contactGuidance).toBe('Your contact information');

      // Simulate API call
      const mockResponse = {
        success: true,
        application_id: 'app-123',
        message: 'Application submitted successfully'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      });

      const response = await fetch('/api/player-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.application_id).toBe('app-123');
    });

    it('should handle complete youth player registration flow', async () => {
      const youthFormData = {
        name: 'Emma Wilson',
        email: 'parent.wilson@example.com', // Parent email
        phone: '+1987654321',
        dateOfBirth: '2010-03-10', // 14 years old
        position: 'forward',
        experienceLevel: 'youth',
        applicationNotes: 'Talented young player with school team experience',
        cvFile: null
      };

      // Transform form data
      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: youthFormData.name.trim(),
        email: youthFormData.email.trim().toLowerCase(),
        phone: youthFormData.phone.trim(),
        date_of_birth: youthFormData.dateOfBirth,
        position: youthFormData.position,
        experience_level: youthFormData.experienceLevel,
        application_notes: youthFormData.applicationNotes.trim(),
        cv_file_path: null
      };

      // Validate the transformed data
      const validation = validatePlayerRegistration(applicationData);
      expect(validation.success).toBe(true);

      // Verify age calculation for UI logic
      const ageInfo = calculatePlayerAge(youthFormData.dateOfBirth);
      expect(ageInfo.age).toBe(14);
      expect(ageInfo.isYouth).toBe(true);
      expect(ageInfo.validationRules.contactFieldLabel).toBe('Parent/Guardian Email');
      expect(ageInfo.validationRules.requiresParentConsent).toBe(true);
      expect(ageInfo.contactGuidance).toContain('Parent/guardian contact information required');

      // Simulate successful API response
      const mockResponse = {
        success: true,
        application_id: 'youth-app-456',
        message: 'Youth application submitted successfully'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      });

      const response = await fetch('/api/player-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.application_id).toBe('youth-app-456');
    });

    it('should handle boundary age cases (exactly 18 years old)', async () => {
      const boundaryFormData = {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '+1555123456',
        dateOfBirth: '2006-08-22', // Exactly 18 years old today
        position: 'defender',
        experienceLevel: 'amateur',
        applicationNotes: 'Just turned 18, ready to play adult football',
        cvFile: null
      };

      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: boundaryFormData.name.trim(),
        email: boundaryFormData.email.trim().toLowerCase(),
        phone: boundaryFormData.phone.trim(),
        date_of_birth: boundaryFormData.dateOfBirth,
        position: boundaryFormData.position,
        experience_level: boundaryFormData.experienceLevel,
        application_notes: boundaryFormData.applicationNotes.trim(),
        cv_file_path: null
      };

      const validation = validatePlayerRegistration(applicationData);
      expect(validation.success).toBe(true);

      // Verify boundary age calculation
      const ageInfo = calculatePlayerAge(boundaryFormData.dateOfBirth);
      expect(ageInfo.age).toBe(18);
      expect(ageInfo.isYouth).toBe(false); // Should be treated as adult
      expect(ageInfo.validationRules.requiresParentConsent).toBe(false);
    });
  });

  describe('Form Validation Error Handling - Requirements 6.1, 6.2, 6.4', () => {
    it('should handle validation errors with date of birth', async () => {
      const invalidFormData = {
        name: '', // Invalid: empty
        email: 'invalid-email', // Invalid: bad format
        phone: '+1234567890',
        date_of_birth: '2025-01-01', // Invalid: future date
        position: '', // Invalid: empty
        experience_level: 'amateur'
      };

      const validation = validatePlayerRegistration(invalidFormData);
      expect(validation.success).toBe(false);
      expect(validation.errors).toBeDefined();

      // Check specific validation errors
      expect(validation.errors!['name']).toBeDefined(); // Name validation error exists
      expect(validation.errors!['email']).toContain('valid email address');
      expect(validation.errors!['date_of_birth']).toContain('age must be between 5 and 65 years');
      expect(validation.errors!['position']).toContain('select a position');

      // Simulate API error response
      const mockErrorResponse = {
        success: false,
        error: 'Validation failed',
        validation_errors: validation.errors
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse
      });

      const response = await fetch('/api/player-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidFormData)
      });

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.validation_errors).toBeDefined();
    });

    it('should handle edge case validation errors', async () => {
      const edgeCaseData = {
        name: 'Valid Name',
        email: 'valid@example.com',
        phone: '+1234567890',
        date_of_birth: '2020-08-22', // 4 years old - too young
        position: 'forward',
        experience_level: 'youth'
      };

      const validation = validatePlayerRegistration(edgeCaseData);
      expect(validation.success).toBe(false);
      expect(validation.errors!['date_of_birth']).toContain('age must be between 5 and 65 years');

      // Test with too old
      const tooOldData = {
        ...edgeCaseData,
        date_of_birth: '1958-08-22' // 66 years old
      };

      const tooOldValidation = validatePlayerRegistration(tooOldData);
      expect(tooOldValidation.success).toBe(false);
      expect(tooOldValidation.errors!['date_of_birth']).toContain('age must be between 5 and 65 years');
    });

    it('should handle malformed date validation', async () => {
      const malformedDateData = {
        name: 'Valid Name',
        email: 'valid@example.com',
        phone: '+1234567890',
        date_of_birth: 'not-a-date',
        position: 'forward',
        experience_level: 'amateur'
      };

      const validation = validatePlayerRegistration(malformedDateData);
      expect(validation.success).toBe(false);
      expect(validation.errors!['date_of_birth']).toContain('valid date');
    });
  });

  describe('Data Transformation and Mapping - Requirements 5.2, 5.3', () => {
    it('should correctly map form fields to database schema', () => {
      const formData = {
        name: '  John Doe  ', // With whitespace
        email: '  JOHN.DOE@EXAMPLE.COM  ', // With whitespace and uppercase
        phone: '  +1 (555) 123-4567  ', // With whitespace and formatting
        dateOfBirth: '1990-05-15', // camelCase
        position: 'midfielder',
        experienceLevel: 'professional', // camelCase
        applicationNotes: '  Looking for new opportunities  ', // With whitespace
        cvFilePath: null
      };

      // Simulate the mapping done in form submission
      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        date_of_birth: formData.dateOfBirth, // snake_case
        position: formData.position,
        experience_level: formData.experienceLevel, // snake_case
        application_notes: formData.applicationNotes.trim() || null, // snake_case
        cv_file_path: formData.cvFilePath
      };

      // Verify the transformation
      expect(applicationData.name).toBe('John Doe');
      expect(applicationData.email).toBe('john.doe@example.com');
      expect(applicationData.phone).toBe('+1 (555) 123-4567');
      expect(applicationData.date_of_birth).toBe('1990-05-15');
      expect(applicationData.experience_level).toBe('professional');
      expect(applicationData.application_notes).toBe('Looking for new opportunities');

      // Validate the transformed data
      const validation = validatePlayerRegistration(applicationData);
      expect(validation.success).toBe(true);
    });

    it('should handle optional fields correctly', () => {
      const minimalFormData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '', // Empty optional field
        dateOfBirth: '1995-08-15',
        position: 'goalkeeper',
        experienceLevel: 'amateur',
        applicationNotes: '', // Empty optional field
        cvFilePath: null
      };

      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: minimalFormData.name.trim(),
        email: minimalFormData.email.trim().toLowerCase(),
        phone: minimalFormData.phone.trim() || null,
        date_of_birth: minimalFormData.dateOfBirth,
        position: minimalFormData.position,
        experience_level: minimalFormData.experienceLevel,
        application_notes: minimalFormData.applicationNotes.trim() || null,
        cv_file_path: minimalFormData.cvFilePath
      };

      // Verify optional fields become null
      expect(applicationData.phone).toBe(null);
      expect(applicationData.application_notes).toBe(null);
      expect(applicationData.cv_file_path).toBe(null);

      const validation = validatePlayerRegistration(applicationData);
      expect(validation.success).toBe(true);
    });

    it('should preserve required date_of_birth field', () => {
      const dataWithoutDate = {
        name: 'Test Player',
        email: 'test@example.com',
        phone: '+1234567890',
        position: 'forward',
        experience_level: 'amateur'
        // Missing date_of_birth
      };

      const validation = validatePlayerRegistration(dataWithoutDate);
      expect(validation.success).toBe(false);
      expect(validation.errors!['date_of_birth']).toBeDefined();
    });
  });

  describe('Age-Based UI Logic Integration - Requirements 3.1, 4.2, 4.3', () => {
    it('should provide correct UI configuration for youth players', () => {
      const youthBirthDate = '2010-06-15'; // 14 years old
      const ageInfo = calculatePlayerAge(youthBirthDate);

      // Verify youth-specific UI configuration
      expect(ageInfo.isYouth).toBe(true);
      expect(ageInfo.validationRules.requiresParentConsent).toBe(true);
      expect(ageInfo.validationRules.contactFieldLabel).toBe('Parent/Guardian Email');
      expect(ageInfo.validationRules.contactFieldPlaceholder).toBe('parent@example.com');
      expect(ageInfo.validationRules.phoneFieldLabel).toBe('Parent/Guardian Phone');
      expect(ageInfo.validationRules.phoneFieldPlaceholder).toBe('Parent/guardian phone number');
      expect(ageInfo.contactGuidance).toContain('Parent/guardian contact information required');
      expect(ageInfo.contactGuidance).toContain('proper consent and communication');
    });

    it('should provide correct UI configuration for adult players', () => {
      const adultBirthDate = '1995-06-15'; // 29 years old
      const ageInfo = calculatePlayerAge(adultBirthDate);

      // Verify adult-specific UI configuration
      expect(ageInfo.isYouth).toBe(false);
      expect(ageInfo.validationRules.requiresParentConsent).toBe(false);
      expect(ageInfo.validationRules.contactFieldLabel).toBe('Email');
      expect(ageInfo.validationRules.contactFieldPlaceholder).toBe('your@example.com');
      expect(ageInfo.validationRules.phoneFieldLabel).toBe('Phone');
      expect(ageInfo.validationRules.phoneFieldPlaceholder).toBe('Your phone number');
      expect(ageInfo.contactGuidance).toBe('Your contact information');
    });

    it('should handle dynamic age changes during form completion', () => {
      // Simulate user changing date of birth from adult to youth
      const initialAdultDate = '2000-01-01'; // 24 years old
      const changedYouthDate = '2010-01-01'; // 14 years old

      const initialAge = calculatePlayerAge(initialAdultDate);
      expect(initialAge.isYouth).toBe(false);
      expect(initialAge.validationRules.contactFieldLabel).toBe('Email');

      const changedAge = calculatePlayerAge(changedYouthDate);
      expect(changedAge.isYouth).toBe(true);
      expect(changedAge.validationRules.contactFieldLabel).toBe('Parent/Guardian Email');

      // Both should be valid ages
      expect(validatePlayerRegistration({
        name: 'Test Player',
        email: 'test@example.com',
        phone: '+1234567890',
        date_of_birth: initialAdultDate,
        position: 'forward',
        experience_level: 'amateur'
      }).success).toBe(true);

      expect(validatePlayerRegistration({
        name: 'Test Player',
        email: 'parent@example.com',
        phone: '+1234567890',
        date_of_birth: changedYouthDate,
        position: 'forward',
        experience_level: 'youth'
      }).success).toBe(true);
    });
  });

  describe('Error Recovery and User Experience - Requirements 7.2, 7.3', () => {
    it('should handle network errors gracefully', async () => {
      const validFormData = {
        name: 'Network Test',
        email: 'network@example.com',
        phone: '+1234567890',
        date_of_birth: '1995-06-15',
        position: 'midfielder',
        experience_level: 'amateur'
      };

      // Simulate network error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/player-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validFormData)
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle server errors with meaningful messages', async () => {
      const validFormData = {
        name: 'Server Test',
        email: 'server@example.com',
        phone: '+1234567890',
        date_of_birth: '1995-06-15',
        position: 'midfielder',
        experience_level: 'amateur'
      };

      // Simulate server error
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Internal server error'
        })
      });

      const response = await fetch('/api/player-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validFormData)
      });

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });

    it('should preserve form data during validation errors', () => {
      const formDataWithErrors = {
        name: 'Valid Name',
        email: 'invalid-email', // Error here
        phone: '+1234567890',
        date_of_birth: '2025-01-01', // Error here
        position: 'forward',
        experience_level: 'amateur',
        application_notes: 'These notes should be preserved'
      };

      const validation = validatePlayerRegistration(formDataWithErrors);
      expect(validation.success).toBe(false);

      // Even with errors, valid fields should be preserved
      expect(formDataWithErrors.name).toBe('Valid Name');
      expect(formDataWithErrors.phone).toBe('+1234567890');
      expect(formDataWithErrors.position).toBe('forward');
      expect(formDataWithErrors.application_notes).toBe('These notes should be preserved');
    });
  });

  describe('Backward Compatibility - Requirements 5.4, 5.5', () => {
    it('should ensure new date_of_birth field is always included', () => {
      // All new applications must include date_of_birth
      const newApplicationData = {
        name: 'New Player',
        email: 'new@example.com',
        phone: '+1234567890',
        date_of_birth: '1995-06-15', // Required for all new applications
        position: 'forward',
        experience_level: 'professional'
      };

      const validation = validatePlayerRegistration(newApplicationData);
      expect(validation.success).toBe(true);
      expect(validation.data!.date_of_birth).toBe('1995-06-15');
    });

    it('should reject applications missing date_of_birth', () => {
      const incompleteData = {
        name: 'Incomplete Player',
        email: 'incomplete@example.com',
        phone: '+1234567890',
        position: 'midfielder',
        experience_level: 'amateur'
        // Missing date_of_birth
      };

      const validation = validatePlayerRegistration(incompleteData);
      expect(validation.success).toBe(false);
      expect(validation.errors!['date_of_birth']).toBeDefined();
    });

    it('should maintain compatibility with existing PlayerApplication interface', () => {
      const completeApplicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: 'Compatible Player',
        email: 'compatible@example.com',
        phone: '+1234567890',
        date_of_birth: '1990-12-25',
        position: 'defender',
        experience_level: 'semi-professional',
        application_notes: 'Testing interface compatibility',
        cv_file_path: null
      };

      // Should match the PlayerApplication interface exactly
      expect(typeof completeApplicationData.name).toBe('string');
      expect(typeof completeApplicationData.email).toBe('string');
      expect(typeof completeApplicationData.phone).toBe('string');
      expect(typeof completeApplicationData.date_of_birth).toBe('string');
      expect(typeof completeApplicationData.position).toBe('string');
      expect(typeof completeApplicationData.experience_level).toBe('string');
      expect(completeApplicationData.application_notes === null || typeof completeApplicationData.application_notes === 'string').toBe(true);
      expect(completeApplicationData.cv_file_path === null || typeof completeApplicationData.cv_file_path === 'string').toBe(true);

      const validation = validatePlayerRegistration(completeApplicationData);
      expect(validation.success).toBe(true);
    });
  });
});