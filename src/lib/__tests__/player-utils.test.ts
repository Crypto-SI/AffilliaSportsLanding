import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculatePlayerAge,
  isValidPlayerAge,
  getAgeValidationError,
  validatePlayerRegistration,
  validateField,
  playerRegistrationSchema,
  type AgeCalculation,
  type PlayerRegistrationForm
} from '../player-utils';

describe('Age Calculation and Validation Logic', () => {
  beforeEach(() => {
    // Mock current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-08-22')); // Current date from system info
  });

  describe('calculatePlayerAge', () => {
    it('should calculate correct age for adult player (25 years old)', () => {
      const dateOfBirth = new Date('1999-08-22'); // Exactly 25 years old
      const result = calculatePlayerAge(dateOfBirth);

      expect(result.age).toBe(25);
      expect(result.isYouth).toBe(false);
      expect(result.contactGuidance).toBe('Your contact information');
      expect(result.validationRules.requiresParentConsent).toBe(false);
      expect(result.validationRules.contactFieldLabel).toBe('Email');
      expect(result.validationRules.contactFieldPlaceholder).toBe('your@example.com');
      expect(result.validationRules.phoneFieldLabel).toBe('Phone');
      expect(result.validationRules.phoneFieldPlaceholder).toBe('Your phone number');
    });

    it('should calculate correct age for youth player (16 years old)', () => {
      const dateOfBirth = new Date('2008-08-22'); // Exactly 16 years old
      const result = calculatePlayerAge(dateOfBirth);

      expect(result.age).toBe(16);
      expect(result.isYouth).toBe(true);
      expect(result.contactGuidance).toBe('Parent/guardian contact information required for players under 18. This ensures proper consent and communication for youth players.');
      expect(result.validationRules.requiresParentConsent).toBe(true);
      expect(result.validationRules.contactFieldLabel).toBe('Parent/Guardian Email');
      expect(result.validationRules.contactFieldPlaceholder).toBe('parent@example.com');
      expect(result.validationRules.phoneFieldLabel).toBe('Parent/Guardian Phone');
      expect(result.validationRules.phoneFieldPlaceholder).toBe('Parent/guardian phone number');
    });

    it('should handle boundary case - exactly 18 years old (adult)', () => {
      const dateOfBirth = new Date('2006-08-22'); // Exactly 18 years old
      const result = calculatePlayerAge(dateOfBirth);

      expect(result.age).toBe(18);
      expect(result.isYouth).toBe(false);
      expect(result.contactGuidance).toBe('Your contact information');
      expect(result.validationRules.requiresParentConsent).toBe(false);
    });

    it('should handle boundary case - 17 years old (youth)', () => {
      const dateOfBirth = new Date('2007-08-22'); // Exactly 17 years old
      const result = calculatePlayerAge(dateOfBirth);

      expect(result.age).toBe(17);
      expect(result.isYouth).toBe(true);
      expect(result.contactGuidance).toBe('Parent/guardian contact information required for players under 18. This ensures proper consent and communication for youth players.');
      expect(result.validationRules.requiresParentConsent).toBe(true);
    });

    it('should handle birthday not yet reached this year', () => {
      const dateOfBirth = new Date('1999-12-25'); // Birthday later in the year
      const result = calculatePlayerAge(dateOfBirth);

      expect(result.age).toBe(24); // Should be 24, not 25
    });

    it('should handle birthday already passed this year', () => {
      const dateOfBirth = new Date('1999-01-15'); // Birthday earlier in the year
      const result = calculatePlayerAge(dateOfBirth);

      expect(result.age).toBe(25); // Should be 25
    });

    it('should accept string date input', () => {
      const result = calculatePlayerAge('1999-08-22');

      expect(result.age).toBe(25);
      expect(result.isYouth).toBe(false);
    });

    it('should handle ISO date string format', () => {
      const result = calculatePlayerAge('1999-08-22T00:00:00.000Z');

      expect(result.age).toBe(25);
      expect(result.isYouth).toBe(false);
    });
  });

  describe('isValidPlayerAge', () => {
    it('should return true for valid adult age (25)', () => {
      const dateOfBirth = new Date('1999-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(true);
    });

    it('should return true for valid youth age (16)', () => {
      const dateOfBirth = new Date('2008-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(true);
    });

    it('should return true for minimum valid age (5)', () => {
      const dateOfBirth = new Date('2019-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(true);
    });

    it('should return true for maximum valid age (65)', () => {
      const dateOfBirth = new Date('1959-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(true);
    });

    it('should return false for age below minimum (4)', () => {
      const dateOfBirth = new Date('2020-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(false);
    });

    it('should return false for age above maximum (66)', () => {
      const dateOfBirth = new Date('1958-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(false);
    });

    it('should return false for future date', () => {
      const dateOfBirth = new Date('2025-08-22');
      expect(isValidPlayerAge(dateOfBirth)).toBe(false);
    });

    it('should accept string date input', () => {
      expect(isValidPlayerAge('1999-08-22')).toBe(true);
      expect(isValidPlayerAge('2025-08-22')).toBe(false);
    });
  });

  describe('getAgeValidationError', () => {
    it('should return future date error for dates in the future', () => {
      const dateOfBirth = new Date('2025-08-22');
      const error = getAgeValidationError(dateOfBirth);
      expect(error).toContain('Date of birth cannot be');
      expect(error).toContain('in the future');
    });

    it('should return minimum age error for age below 5', () => {
      const dateOfBirth = new Date('2020-08-22'); // 4 years old
      const error = getAgeValidationError(dateOfBirth);
      expect(error).toContain('must be at least 5 years old');
      expect(error).toContain('4 years old');
    });

    it('should return specific error for age above 65', () => {
      const dateOfBirth = new Date('1958-08-22'); // 66 years old
      const error = getAgeValidationError(dateOfBirth);
      expect(error).toContain('over 65 years old');
      expect(error).toContain('contact us directly');
    });

    it('should return generic error for valid ages (no error case)', () => {
      const dateOfBirth = new Date('1999-08-22'); // 25 years old
      expect(getAgeValidationError(dateOfBirth)).toBe('Please enter a valid date of birth');
    });

    it('should accept string date input', () => {
      const futureError = getAgeValidationError('2025-08-22');
      expect(futureError).toContain('Date of birth cannot be');
      expect(futureError).toContain('in the future');
      
      const youngError = getAgeValidationError('2020-08-22');
      expect(youngError).toContain('must be at least 5 years old');
    });
  });

  describe('playerRegistrationSchema validation', () => {
    const validFormData: PlayerRegistrationForm = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      date_of_birth: '1999-08-22',
      position: 'Forward',
      experience_level: 'Intermediate',
      application_notes: 'Looking forward to joining the team',
      cv_file_path: '/uploads/cv.pdf'
    };

    it('should validate complete valid form data', () => {
      const result = playerRegistrationSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it('should validate form data without optional fields', () => {
      const { application_notes, cv_file_path, ...requiredData } = validFormData;
      const result = playerRegistrationSchema.safeParse(requiredData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date of birth (future date)', () => {
      const invalidData = { ...validFormData, date_of_birth: '2025-08-22' };
      const result = playerRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('age must be between 5 and 65 years');
      }
    });

    it('should reject invalid date of birth (too young)', () => {
      const invalidData = { ...validFormData, date_of_birth: '2020-08-22' };
      const result = playerRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('age must be between 5 and 65 years');
      }
    });

    it('should reject invalid date of birth (too old)', () => {
      const invalidData = { ...validFormData, date_of_birth: '1958-08-22' };
      const result = playerRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('age must be between 5 and 65 years');
      }
    });

    it('should reject invalid date format', () => {
      const invalidData = { ...validFormData, date_of_birth: 'invalid-date' };
      const result = playerRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Please enter a valid date');
      }
    });
  });

  describe('validatePlayerRegistration', () => {
    const validFormData: PlayerRegistrationForm = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      date_of_birth: '1999-08-22',
      position: 'Forward',
      experience_level: 'Intermediate'
    };

    it('should return success for valid data', () => {
      const result = validatePlayerRegistration(validFormData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validFormData);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidData = { ...validFormData, date_of_birth: '2025-08-22' };
      const result = validatePlayerRegistration(invalidData);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors!['date_of_birth']).toContain('age must be between 5 and 65 years');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        ...validFormData,
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        date_of_birth: '2025-08-22' // Future date
      };
      const result = validatePlayerRegistration(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Object.keys(result.errors!)).toHaveLength(3);
    });
  });

  describe('validateField', () => {
    it('should validate individual field - valid date_of_birth', () => {
      const result = validateField('date_of_birth', '1999-08-22');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate individual field - invalid date_of_birth', () => {
      const result = validateField('date_of_birth', '2025-08-22');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('age must be between 5 and 65 years');
    });

    it('should validate individual field - valid name', () => {
      const result = validateField('name', 'John Doe');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate individual field - invalid name', () => {
      const result = validateField('name', 'A');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name must be at least 2 characters');
    });
  });

  describe('Business Logic Requirements', () => {
    it('should correctly categorize youth vs adult players', () => {
      // Youth player (17 years old)
      const youthResult = calculatePlayerAge('2007-08-22');
      expect(youthResult.isYouth).toBe(true);
      expect(youthResult.validationRules.requiresParentConsent).toBe(true);

      // Adult player (18 years old)
      const adultResult = calculatePlayerAge('2006-08-22');
      expect(adultResult.isYouth).toBe(false);
      expect(adultResult.validationRules.requiresParentConsent).toBe(false);
    });

    it('should provide appropriate contact guidance for different age groups', () => {
      // Youth player guidance
      const youthResult = calculatePlayerAge('2010-08-22');
      expect(youthResult.contactGuidance).toBe('Parent/guardian contact information required for players under 18. This ensures proper consent and communication for youth players.');

      // Adult player guidance
      const adultResult = calculatePlayerAge('2000-08-22');
      expect(adultResult.contactGuidance).toBe('Your contact information');
    });

    it('should enforce reasonable age ranges (5-65 years)', () => {
      // Valid minimum age
      expect(isValidPlayerAge('2019-08-22')).toBe(true); // 5 years old

      // Valid maximum age
      expect(isValidPlayerAge('1959-08-22')).toBe(true); // 65 years old

      // Invalid - too young
      expect(isValidPlayerAge('2020-08-22')).toBe(false); // 4 years old

      // Invalid - too old
      expect(isValidPlayerAge('1958-08-22')).toBe(false); // 66 years old
    });
  });

  describe('Enhanced Form Validation (Task 6)', () => {
    describe('Age-specific validation rules', () => {
      it('should provide age-appropriate error messages for youth players', () => {
        const youthAge = calculatePlayerAge('2010-08-22'); // 14 years old
        expect(youthAge.isYouth).toBe(true);
        expect(youthAge.validationRules.contactFieldLabel).toBe('Parent/Guardian Email');
        expect(youthAge.validationRules.phoneFieldLabel).toBe('Parent/Guardian Phone');
        expect(youthAge.validationRules.requiresParentConsent).toBe(true);
      });

      it('should provide age-appropriate error messages for adult players', () => {
        const adultAge = calculatePlayerAge('2000-08-22'); // 24 years old
        expect(adultAge.isYouth).toBe(false);
        expect(adultAge.validationRules.contactFieldLabel).toBe('Email');
        expect(adultAge.validationRules.phoneFieldLabel).toBe('Phone');
        expect(adultAge.validationRules.requiresParentConsent).toBe(false);
      });
    });

    describe('Comprehensive field validation', () => {
      it('should validate all required fields', () => {
        const invalidData = {
          name: '',
          email: '',
          phone: '', // Empty phone should be allowed (optional)
          date_of_birth: '',
          position: '',
          experience_level: '',
          application_notes: ''
        };

        const result = validatePlayerRegistration(invalidData);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
        
        // Check that all required fields have errors
        expect(result.errors!['name']).toBeDefined();
        expect(result.errors!['email']).toBeDefined();
        expect(result.errors!['date_of_birth']).toBeDefined();
        expect(result.errors!['position']).toBeDefined();
        expect(result.errors!['experience_level']).toBeDefined();
        
        // Phone and notes are optional, so should not have errors for empty values
        // Note: Phone field validates when provided, but empty string should be allowed
        if (result.errors!['phone']) {
          // If phone has an error, it should be about format, not being required
          expect(result.errors!['phone']).not.toContain('required');
        }
        expect(result.errors!['application_notes']).toBeUndefined();
      });

      it('should allow empty optional fields', () => {
        const dataWithEmptyOptionals = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '', // Empty phone should be allowed
          date_of_birth: '2000-08-22',
          position: 'midfielder',
          experience_level: 'amateur',
          application_notes: '' // Empty notes should be allowed
        };

        const result = validatePlayerRegistration(dataWithEmptyOptionals);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it('should validate name field with specific rules', () => {
        // Too short
        expect(validateField('name', 'A').isValid).toBe(false);
        expect(validateField('name', 'A').error).toBe('Name must be at least 2 characters');

        // Invalid characters
        expect(validateField('name', 'John123').isValid).toBe(false);
        expect(validateField('name', 'John123').error).toContain('letters, spaces, hyphens, and apostrophes');

        // Valid names
        expect(validateField('name', 'John Doe').isValid).toBe(true);
        expect(validateField('name', "O'Connor").isValid).toBe(true);
        expect(validateField('name', 'Mary-Jane Smith').isValid).toBe(true);
      });

      it('should validate email field with proper format', () => {
        // Invalid email formats
        expect(validateField('email', 'invalid-email').isValid).toBe(false);
        expect(validateField('email', 'test@').isValid).toBe(false);
        expect(validateField('email', '@example.com').isValid).toBe(false);

        // Valid email formats
        expect(validateField('email', 'test@example.com').isValid).toBe(true);
        expect(validateField('email', 'parent.guardian@email.co.uk').isValid).toBe(true);
      });

      it('should validate phone field with international formats', () => {
        // Invalid phone formats
        expect(validateField('phone', 'abc123').isValid).toBe(false);
        expect(validateField('phone', '123').isValid).toBe(false); // Too short

        // Valid phone formats
        expect(validateField('phone', '+1234567890').isValid).toBe(true);
        expect(validateField('phone', '(555) 123-4567').isValid).toBe(true);
        expect(validateField('phone', '555.123.4567').isValid).toBe(true);
      });

      it('should validate date of birth with age restrictions', () => {
        // Future date
        expect(validateField('date_of_birth', '2025-12-31').isValid).toBe(false);

        // Too young (under 5)
        expect(validateField('date_of_birth', '2020-08-22').isValid).toBe(false);

        // Too old (over 65)
        expect(validateField('date_of_birth', '1958-08-22').isValid).toBe(false);

        // Valid ages
        expect(validateField('date_of_birth', '2019-08-22').isValid).toBe(true); // 5 years old
        expect(validateField('date_of_birth', '2010-08-22').isValid).toBe(true); // 14 years old
        expect(validateField('date_of_birth', '2000-08-22').isValid).toBe(true); // 24 years old
        expect(validateField('date_of_birth', '1959-08-22').isValid).toBe(true); // 65 years old
      });

      it('should validate application notes length', () => {
        const longNotes = 'a'.repeat(1001); // 1001 characters
        expect(validateField('application_notes', longNotes).isValid).toBe(false);
        expect(validateField('application_notes', longNotes).error).toContain('1000 characters');

        const validNotes = 'a'.repeat(1000); // 1000 characters
        expect(validateField('application_notes', validNotes).isValid).toBe(true);
      });
    });

    describe('Error message customization', () => {
      it('should provide specific error messages for different validation failures', () => {
        // Date validation errors
        const futureError = getAgeValidationError('2025-08-22');
        expect(futureError).toContain('Date of birth cannot be');
        expect(futureError).toContain('in the future');
        
        const youngError = getAgeValidationError('2020-08-22');
        expect(youngError).toContain('must be at least 5 years old');
        
        const oldError = getAgeValidationError('1958-08-22');
        expect(oldError).toContain('over 65 years old');

        // Field validation errors should be descriptive
        const nameValidation = validateField('name', 'A');
        expect(nameValidation.error).toBe('Name must be at least 2 characters');

        const emailValidation = validateField('email', 'invalid');
        expect(emailValidation.error).toBe('Please enter a valid email address');
      });
    });

    describe('Form-level validation integration', () => {
      it('should validate complete form with mixed valid and invalid data', () => {
        const mixedData = {
          name: 'John Doe', // Valid
          email: 'invalid-email', // Invalid
          phone: '+1234567890', // Valid
          date_of_birth: '2000-08-22', // Valid
          position: '', // Invalid (required)
          experience_level: 'amateur', // Valid
          application_notes: 'Some notes' // Valid
        };

        const result = validatePlayerRegistration(mixedData);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors!['email']).toBeDefined();
        expect(result.errors!['position']).toBeDefined();
        expect(Object.keys(result.errors!)).toHaveLength(2);
      });

      it('should pass validation for complete valid form data', () => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          date_of_birth: '2000-08-22',
          position: 'midfielder',
          experience_level: 'amateur',
          application_notes: 'Looking forward to joining'
        };

        const result = validatePlayerRegistration(validData);
        expect(result.success).toBe(true);
        expect(result.data).toEqual(validData);
        expect(result.errors).toBeUndefined();
      });
    });
  });
});