import { calculatePlayerAge, type AgeCalculation } from './player-utils';

/**
 * Youth Player Security Enhancements
 * 
 * This module provides additional security measures specifically for youth player data
 * to ensure compliance with data protection regulations and safeguard minor information.
 */

// Security configuration for youth players
export const YOUTH_SECURITY_CONFIG = {
  // Age threshold for youth classification
  YOUTH_AGE_THRESHOLD: 18,
  
  // Enhanced rate limiting for youth applications
  YOUTH_RATE_LIMIT: {
    maxSubmissions: 3, // Max 3 youth applications per hour per IP
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Data retention policies for youth players
  DATA_RETENTION: {
    youthApplicationRetentionDays: 2555, // 7 years (common legal requirement)
    adultApplicationRetentionDays: 1825, // 5 years
  },
  
  // Security flags for enhanced protection
  ENHANCED_VALIDATION: {
    requireParentEmailValidation: true,
    requireExplicitConsent: true,
    enableDataMinimization: true,
  }
} as const;

/**
 * Enhanced validation specifically for youth player applications
 */
export interface YouthSecurityValidation {
  isYouth: boolean;
  securityLevel: 'standard' | 'enhanced';
  requiredConsents: string[];
  dataHandlingFlags: {
    requiresParentConsent: boolean;
    enhancedPrivacy: boolean;
    restrictedDataSharing: boolean;
    auditLogging: boolean;
  };
  validationRules: {
    emailDomainRestrictions?: string[];
    phoneNumberValidation: 'standard' | 'enhanced';
    additionalVerification: boolean;
  };
}

/**
 * Determine security requirements based on player age
 */
export const getYouthSecurityRequirements = (dateOfBirth: string): YouthSecurityValidation => {
  // Calculate age directly to avoid circular dependency
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const isYouth = age < YOUTH_SECURITY_CONFIG.YOUTH_AGE_THRESHOLD;
  
  return {
    isYouth,
    securityLevel: isYouth ? 'enhanced' : 'standard',
    requiredConsents: isYouth ? [
      'parent_guardian_consent',
      'data_processing_consent',
      'communication_consent'
    ] : [
      'data_processing_consent'
    ],
    dataHandlingFlags: {
      requiresParentConsent: isYouth,
      enhancedPrivacy: isYouth,
      restrictedDataSharing: isYouth,
      auditLogging: isYouth, // Enhanced logging for youth applications
    },
    validationRules: {
      emailDomainRestrictions: isYouth ? [
        // Common personal email domains that parents typically use
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'
      ] : undefined,
      phoneNumberValidation: isYouth ? 'enhanced' : 'standard',
      additionalVerification: isYouth,
    }
  };
};

/**
 * Enhanced email validation for parent/guardian emails
 */
export const validateParentGuardianEmail = (email: string, isYouth: boolean): {
  isValid: boolean;
  error?: string;
  securityFlags?: string[];
} => {
  if (!isYouth) {
    return { isValid: true };
  }

  const securityFlags: string[] = [];
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid parent/guardian email address'
    };
  }

  // Check for suspicious patterns that might indicate a minor's email
  const suspiciousPatterns = [
    /(kid|child|teen|young|junior|jr)/i, // Removed word boundaries to catch patterns like "kid123"
    /\d{4}/, // Birth year patterns (removed word boundaries)
    /(student|school)/i, // Removed word boundaries
  ];

  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(email));
  if (hasSuspiciousPattern) {
    securityFlags.push('suspicious_youth_email_pattern');
  }

  // Check for common youth-oriented email domains
  const youthDomains = [
    'student.', '.edu', 'school.', 'college.', 'university.'
  ];
  
  const hasYouthDomain = youthDomains.some(domain => email.toLowerCase().includes(domain));
  if (hasYouthDomain) {
    securityFlags.push('youth_oriented_domain');
  }

  // Enhanced validation for parent/guardian emails
  if (securityFlags.length > 0) {
    return {
      isValid: false,
      error: 'Please ensure this is a parent or guardian email address. Youth players must provide parent/guardian contact information.',
      securityFlags
    };
  }

  return { isValid: true, securityFlags };
};

/**
 * Enhanced phone number validation for parent/guardian contacts
 */
export const validateParentGuardianPhone = (phone: string, isYouth: boolean): {
  isValid: boolean;
  error?: string;
  securityFlags?: string[];
} => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Phone is optional
  }

  if (!isYouth) {
    return { isValid: true };
  }

  const securityFlags: string[] = [];
  
  // Enhanced phone validation for youth applications
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check minimum length
  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: 'Please enter a valid parent/guardian phone number (at least 10 digits)'
    };
  }

  // Check for patterns that might indicate a youth's phone
  // (This is heuristic and may need adjustment based on regional patterns)
  const suspiciousPatterns = [
    /^(\d)\1{9,}$/, // Repeated digits (like 1111111111)
    /^(123|000|999)/, // Common fake number patterns
  ];

  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(cleanPhone));
  if (hasSuspiciousPattern) {
    securityFlags.push('suspicious_phone_pattern');
    return {
      isValid: false,
      error: 'Please enter a valid parent/guardian phone number',
      securityFlags
    };
  }

  return { isValid: true, securityFlags };
};

/**
 * Data sanitization for youth player information
 */
export const sanitizeYouthPlayerData = (data: any, isYouth: boolean): any => {
  if (!isYouth) {
    return data;
  }

  // Enhanced data sanitization for youth players
  const sanitized = { ...data };
  
  // Remove any potentially sensitive metadata
  delete sanitized.ip_address;
  delete sanitized.user_agent;
  delete sanitized.session_id;
  
  // Ensure contact information is clearly marked as parent/guardian
  if (sanitized.email) {
    sanitized.contact_type = 'parent_guardian';
  }
  
  // Add youth protection flags
  sanitized.is_youth_application = true;
  sanitized.requires_parent_consent = true;
  sanitized.enhanced_privacy = true;
  
  return sanitized;
};

/**
 * Generate audit log entry for youth player applications
 */
export const createYouthAuditLog = (
  applicationId: string,
  action: string,
  details: any,
  ipAddress?: string
): {
  timestamp: string;
  application_id: string;
  action: string;
  details: any;
  security_level: string;
  ip_address?: string;
} => {
  return {
    timestamp: new Date().toISOString(),
    application_id: applicationId,
    action,
    details: {
      ...details,
      // Remove sensitive information from audit logs
      email: details.email ? '[REDACTED]' : undefined,
      phone: details.phone ? '[REDACTED]' : undefined,
    },
    security_level: 'enhanced_youth_protection',
    ip_address: ipAddress ? ipAddress.substring(0, ipAddress.lastIndexOf('.')) + '.xxx' : undefined, // Partial IP for privacy
  };
};

/**
 * Check if additional verification is required for youth applications
 */
export const requiresAdditionalVerification = (
  email: string,
  phone: string,
  dateOfBirth: string
): {
  required: boolean;
  reasons: string[];
  verificationMethods: string[];
} => {
  // Calculate age directly to avoid circular dependency
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const isYouth = age < YOUTH_SECURITY_CONFIG.YOUTH_AGE_THRESHOLD;
  
  if (!isYouth) {
    return {
      required: false,
      reasons: [],
      verificationMethods: []
    };
  }

  const reasons: string[] = [];
  const verificationMethods: string[] = [];

  // Check email validation results
  const emailValidation = validateParentGuardianEmail(email, true);
  if (emailValidation.securityFlags && emailValidation.securityFlags.length > 0) {
    reasons.push('Suspicious email pattern detected');
    verificationMethods.push('email_verification');
  }

  // Check phone validation results
  if (phone) {
    const phoneValidation = validateParentGuardianPhone(phone, true);
    if (phoneValidation.securityFlags && phoneValidation.securityFlags.length > 0) {
      reasons.push('Suspicious phone pattern detected');
      verificationMethods.push('phone_verification');
    }
  }

  // Age-based verification requirements
  if (age < 13) {
    reasons.push('Player under 13 requires enhanced verification');
    verificationMethods.push('parent_document_verification');
  }

  return {
    required: reasons.length > 0,
    reasons,
    verificationMethods
  };
};

/**
 * Generate secure token for youth application tracking
 */
export const generateSecureYouthToken = (applicationId: string): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  const combined = `${applicationId}-${timestamp}-${random}`;
  
  // Simple hash function for token generation (in production, use crypto.subtle)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `youth_${Math.abs(hash).toString(36)}`;
};