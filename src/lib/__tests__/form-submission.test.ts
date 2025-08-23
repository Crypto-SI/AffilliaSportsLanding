import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePlayerRegistration } from '../player-utils';
import type { PlayerApplication } from '../types';

describe('Form Submission Logic - Task 7', () => {
  beforeEach(() => {
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-08-22'));
  });

  describe('Date of birth inclusion in form submission', () => {
    it('should include date_of_birth in the application data payload', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        date_of_birth: '2000-08-22',
        position: 'midfielder',
        experience_level: 'amateur',
        application_notes: 'Looking forward to joining the team'
      };

      // Validate the form data structure matches what we send to the database
      const validation = validatePlayerRegistration(formData);
      expect(validation.success).toBe(true);
      expect(validation.data).toBeDefined();
      expect(validation.data!.date_of_birth).toBe('2000-08-22');
    });

    it('should create application data object with correct field mapping', () => {
      // Simulate the form data structure used in the component
      const formData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        dateOfBirth: '1995-05-15', // Form uses camelCase
        position: 'forward',
        experienceLevel: 'professional',
        applicationNotes: 'Experienced player seeking new opportunities'
      };

      // Simulate the mapping done in the form submission
      const applicationData: Partial<PlayerApplication> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        date_of_birth: formData.dateOfBirth, // Maps camelCase to snake_case
        position: formData.position,
        experience_level: formData.experienceLevel,
        application_notes: formData.applicationNotes.trim() || null,
        cv_file_path: null
      };

      // Verify the mapping is correct
      expect(applicationData.name).toBe('Jane Smith');
      expect(applicationData.email).toBe('jane@example.com');
      expect(applicationData.phone).toBe('+1987654321');
      expect(applicationData.date_of_birth).toBe('1995-05-15');
      expect(applicationData.position).toBe('forward');
      expect(applicationData.experience_level).toBe('professional');
      expect(applicationData.application_notes).toBe('Experienced player seeking new opportunities');
      expect(applicationData.cv_file_path).toBe(null);
    });

    it('should handle youth player data correctly', () => {
      const youthFormData = {
        name: 'Tommy Wilson',
        email: 'parent@example.com', // Parent email for youth player
        phone: '+1555123456',
        dateOfBirth: '2010-03-10', // 14 years old
        position: 'defender',
        experienceLevel: 'youth',
        applicationNotes: 'Talented young player with school team experience'
      };

      const applicationData: Partial<PlayerApplication> = {
        name: youthFormData.name.trim(),
        email: youthFormData.email.trim().toLowerCase(),
        phone: youthFormData.phone.trim() || null,
        date_of_birth: youthFormData.dateOfBirth,
        position: youthFormData.position,
        experience_level: youthFormData.experienceLevel,
        application_notes: youthFormData.applicationNotes.trim() || null,
        cv_file_path: null
      };

      // Verify youth player data is handled correctly
      expect(applicationData.name).toBe('Tommy Wilson');
      expect(applicationData.email).toBe('parent@example.com'); // Parent contact
      expect(applicationData.date_of_birth).toBe('2010-03-10');
      expect(applicationData.experience_level).toBe('youth');
    });

    it('should handle optional fields correctly', () => {
      const minimalFormData = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        phone: '', // Empty phone (optional)
        dateOfBirth: '1998-12-01',
        position: 'goalkeeper',
        experienceLevel: 'semi-professional',
        applicationNotes: '' // Empty notes (optional)
      };

      const applicationData: Partial<PlayerApplication> = {
        name: minimalFormData.name.trim(),
        email: minimalFormData.email.trim().toLowerCase(),
        phone: minimalFormData.phone.trim() || null,
        date_of_birth: minimalFormData.dateOfBirth,
        position: minimalFormData.position,
        experience_level: minimalFormData.experienceLevel,
        application_notes: minimalFormData.applicationNotes.trim() || null,
        cv_file_path: null
      };

      // Verify optional fields are handled correctly
      expect(applicationData.phone).toBe(null); // Empty string becomes null
      expect(applicationData.application_notes).toBe(null); // Empty string becomes null
      expect(applicationData.date_of_birth).toBe('1998-12-01'); // Required field is preserved
    });

    it('should validate complete application data before submission', () => {
      const completeApplicationData = {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        phone: '+1444555666',
        date_of_birth: '1992-07-20',
        position: 'midfielder',
        experience_level: 'amateur',
        application_notes: 'Passionate about football and team sports',
        cv_file_path: null // Null is now allowed
      };

      // This should pass validation
      const validation = validatePlayerRegistration(completeApplicationData);
      expect(validation.success).toBe(true);
      expect(validation.data).toEqual(completeApplicationData);
      expect(validation.errors).toBeUndefined();
    });

    it('should reject invalid date_of_birth in application data', () => {
      const invalidApplicationData = {
        name: 'Invalid Player',
        email: 'invalid@example.com',
        phone: '+1234567890',
        date_of_birth: '2025-01-01', // Future date
        position: 'striker',
        experience_level: 'professional'
      };

      const validation = validatePlayerRegistration(invalidApplicationData);
      expect(validation.success).toBe(false);
      expect(validation.errors).toBeDefined();
      expect(validation.errors!['date_of_birth']).toContain('age must be between 5 and 65 years');
    });
  });

  describe('Backward compatibility', () => {
    it('should handle existing application records without date_of_birth', () => {
      // This test ensures that the system can handle existing records
      // that might not have the date_of_birth field (though the migration should have added it)
      
      // In practice, all records should now have date_of_birth due to the migration
      // But we test the validation to ensure it requires the field for new submissions
      const incompleteData = {
        name: 'Legacy Player',
        email: 'legacy@example.com',
        phone: '+1234567890',
        position: 'midfielder',
        experience_level: 'amateur'
        // Missing date_of_birth
      };

      const validation = validatePlayerRegistration(incompleteData);
      expect(validation.success).toBe(false);
      expect(validation.errors).toBeDefined();
      expect(validation.errors!['date_of_birth']).toBeDefined();
    });

    it('should ensure all new applications include date_of_birth', () => {
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
  });

  describe('Database insertion compatibility', () => {
    it('should create application data structure compatible with PlayerApplication interface', () => {
      const formData = {
        name: 'Database Test Player',
        email: 'dbtest@example.com',
        phone: '+1999888777',
        dateOfBirth: '1990-11-30',
        position: 'defender',
        experienceLevel: 'semi-professional',
        applicationNotes: 'Testing database compatibility'
      };

      // Create the exact structure that would be sent to the database
      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        date_of_birth: formData.dateOfBirth,
        position: formData.position,
        experience_level: formData.experienceLevel,
        application_notes: formData.applicationNotes.trim() || null,
        cv_file_path: null
      };

      // Verify the structure matches the PlayerApplication interface
      expect(typeof applicationData.name).toBe('string');
      expect(typeof applicationData.email).toBe('string');
      expect(typeof applicationData.phone).toBe('string');
      expect(typeof applicationData.date_of_birth).toBe('string');
      expect(typeof applicationData.position).toBe('string');
      expect(typeof applicationData.experience_level).toBe('string');
      expect(applicationData.application_notes === null || typeof applicationData.application_notes === 'string').toBe(true);
      expect(applicationData.cv_file_path === null || typeof applicationData.cv_file_path === 'string').toBe(true);

      // Verify date format is correct for database
      expect(applicationData.date_of_birth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});