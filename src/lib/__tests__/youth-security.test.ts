import { describe, it, expect } from 'vitest';
import {
  getYouthSecurityRequirements,
  validateParentGuardianEmail,
  validateParentGuardianPhone,
  sanitizeYouthPlayerData,
  createYouthAuditLog,
  requiresAdditionalVerification,
  generateSecureYouthToken,
  YOUTH_SECURITY_CONFIG
} from '../youth-security';

describe('Youth Security Enhancements', () => {
  describe('getYouthSecurityRequirements', () => {
    it('should return enhanced security for youth players', () => {
      const youthDate = '2010-06-15'; // 13-14 years old
      const requirements = getYouthSecurityRequirements(youthDate);
      
      expect(requirements.isYouth).toBe(true);
      expect(requirements.securityLevel).toBe('enhanced');
      expect(requirements.requiredConsents).toContain('parent_guardian_consent');
      expect(requirements.dataHandlingFlags.requiresParentConsent).toBe(true);
      expect(requirements.dataHandlingFlags.enhancedPrivacy).toBe(true);
      expect(requirements.dataHandlingFlags.auditLogging).toBe(true);
    });

    it('should return standard security for adult players', () => {
      const adultDate = '1995-06-15'; // 28-29 years old
      const requirements = getYouthSecurityRequirements(adultDate);
      
      expect(requirements.isYouth).toBe(false);
      expect(requirements.securityLevel).toBe('standard');
      expect(requirements.requiredConsents).not.toContain('parent_guardian_consent');
      expect(requirements.dataHandlingFlags.requiresParentConsent).toBe(false);
      expect(requirements.dataHandlingFlags.enhancedPrivacy).toBe(false);
    });

    it('should handle edge case of exactly 18 years old', () => {
      const today = new Date();
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const adultDate = eighteenYearsAgo.toISOString().split('T')[0];
      
      const requirements = getYouthSecurityRequirements(adultDate);
      expect(requirements.isYouth).toBe(false);
      expect(requirements.securityLevel).toBe('standard');
    });
  });

  describe('validateParentGuardianEmail', () => {
    it('should pass valid parent email for youth applications', () => {
      const result = validateParentGuardianEmail('parent@gmail.com', true);
      expect(result.isValid).toBe(true);
    });

    it('should reject suspicious youth email patterns', () => {
      const suspiciousEmails = [
        'kid123@gmail.com',
        'teen2010@yahoo.com',
        'young_player@hotmail.com',
        'student123@gmail.com'
      ];

      suspiciousEmails.forEach(email => {
        const result = validateParentGuardianEmail(email, true);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('parent or guardian');
        expect(result.securityFlags).toBeDefined();
        expect(result.securityFlags).toContain('suspicious_youth_email_pattern');
      });
    });

    it('should flag educational domain emails', () => {
      const educationalEmails = [
        'parent@student.school.edu',
        'guardian@university.edu',
        'contact@college.edu'
      ];

      educationalEmails.forEach(email => {
        const result = validateParentGuardianEmail(email, true);
        expect(result.isValid).toBe(false);
        expect(result.securityFlags).toContain('youth_oriented_domain');
      });
    });

    it('should pass validation for adult applications regardless of email pattern', () => {
      const result = validateParentGuardianEmail('kid123@gmail.com', false);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@gmail.com',
        'test@',
        'test@.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateParentGuardianEmail(email, true);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('valid parent/guardian email');
      });
    });
  });

  describe('validateParentGuardianPhone', () => {
    it('should pass valid parent phone numbers for youth applications', () => {
      const validPhones = [
        '5551234567', // Simple 10-digit number
        '15551234567' // 11-digit with country code
      ];

      validPhones.forEach(phone => {
        const result = validateParentGuardianPhone(phone, true);
        expect(result.isValid).toBe(true);
      });
    });

    it('should allow empty phone numbers (optional field)', () => {
      const result = validateParentGuardianPhone('', true);
      expect(result.isValid).toBe(true);
    });

    it('should reject suspicious phone patterns', () => {
      const suspiciousPhones = [
        '1111111111',
        '0000000000',
        '1234567890',
        '9999999999'
      ];

      suspiciousPhones.forEach(phone => {
        const result = validateParentGuardianPhone(phone, true);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('valid parent/guardian phone');
        expect(result.securityFlags).toContain('suspicious_phone_pattern');
      });
    });

    it('should reject phone numbers that are too short', () => {
      const result = validateParentGuardianPhone('123456789', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 10 digits');
    });

    it('should pass validation for adult applications', () => {
      const result = validateParentGuardianPhone('1111111111', false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeYouthPlayerData', () => {
    it('should add youth protection flags for youth applications', () => {
      const inputData = {
        name: 'John Doe',
        email: 'parent@gmail.com',
        phone: '555-123-4567',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        session_id: 'abc123'
      };

      const sanitized = sanitizeYouthPlayerData(inputData, true);
      
      expect(sanitized.is_youth_application).toBe(true);
      expect(sanitized.requires_parent_consent).toBe(true);
      expect(sanitized.enhanced_privacy).toBe(true);
      expect(sanitized.contact_type).toBe('parent_guardian');
      
      // Sensitive data should be removed
      expect(sanitized.ip_address).toBeUndefined();
      expect(sanitized.user_agent).toBeUndefined();
      expect(sanitized.session_id).toBeUndefined();
    });

    it('should not modify data for adult applications', () => {
      const inputData = {
        name: 'John Doe',
        email: 'john@gmail.com',
        phone: '555-123-4567'
      };

      const sanitized = sanitizeYouthPlayerData(inputData, false);
      expect(sanitized).toEqual(inputData);
    });
  });

  describe('createYouthAuditLog', () => {
    it('should create proper audit log entry', () => {
      const auditLog = createYouthAuditLog(
        'app123',
        'youth_application_submitted',
        {
          age: 15,
          email: 'parent@gmail.com',
          phone: '555-123-4567'
        },
        '192.168.1.1'
      );

      expect(auditLog.application_id).toBe('app123');
      expect(auditLog.action).toBe('youth_application_submitted');
      expect(auditLog.security_level).toBe('enhanced_youth_protection');
      expect(auditLog.timestamp).toBeDefined();
      
      // Sensitive data should be redacted
      expect(auditLog.details.email).toBe('[REDACTED]');
      expect(auditLog.details.phone).toBe('[REDACTED]');
      
      // IP should be partially masked
      expect(auditLog.ip_address).toBe('192.168.1.xxx');
    });

    it('should handle missing IP address', () => {
      const auditLog = createYouthAuditLog(
        'app123',
        'test_action',
        { age: 15 }
      );

      expect(auditLog.ip_address).toBeUndefined();
    });
  });

  describe('requiresAdditionalVerification', () => {
    it('should not require verification for adult applications', () => {
      const result = requiresAdditionalVerification(
        'adult@gmail.com',
        '555-123-4567',
        '1995-06-15'
      );

      expect(result.required).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });

    it('should require verification for suspicious youth email patterns', () => {
      const result = requiresAdditionalVerification(
        'kid123@gmail.com',
        '555-123-4567',
        '2010-06-15'
      );

      expect(result.required).toBe(true);
      expect(result.reasons).toContain('Suspicious email pattern detected');
      expect(result.verificationMethods).toContain('email_verification');
    });

    it('should require verification for suspicious phone patterns', () => {
      const result = requiresAdditionalVerification(
        'parent@gmail.com',
        '1111111111',
        '2010-06-15'
      );

      expect(result.required).toBe(true);
      expect(result.reasons).toContain('Suspicious phone pattern detected');
      expect(result.verificationMethods).toContain('phone_verification');
    });

    it('should require enhanced verification for very young players', () => {
      const result = requiresAdditionalVerification(
        'parent@gmail.com',
        '555-123-4567',
        '2015-06-15' // ~8-9 years old
      );

      expect(result.required).toBe(true);
      expect(result.reasons).toContain('Player under 13 requires enhanced verification');
      expect(result.verificationMethods).toContain('parent_document_verification');
    });
  });

  describe('generateSecureYouthToken', () => {
    it('should generate unique tokens', () => {
      const token1 = generateSecureYouthToken('app123');
      const token2 = generateSecureYouthToken('app123');
      
      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^youth_[a-z0-9]+$/);
      expect(token2).toMatch(/^youth_[a-z0-9]+$/);
    });

    it('should generate tokens with youth prefix', () => {
      const token = generateSecureYouthToken('app123');
      expect(token).toMatch(/^youth_/);
    });
  });

  describe('YOUTH_SECURITY_CONFIG', () => {
    it('should have proper configuration values', () => {
      expect(YOUTH_SECURITY_CONFIG.YOUTH_AGE_THRESHOLD).toBe(18);
      expect(YOUTH_SECURITY_CONFIG.YOUTH_RATE_LIMIT.maxSubmissions).toBe(3);
      expect(YOUTH_SECURITY_CONFIG.YOUTH_RATE_LIMIT.windowMs).toBe(60 * 60 * 1000);
      expect(YOUTH_SECURITY_CONFIG.DATA_RETENTION.youthApplicationRetentionDays).toBeGreaterThan(
        YOUTH_SECURITY_CONFIG.DATA_RETENTION.adultApplicationRetentionDays
      );
    });
  });
});