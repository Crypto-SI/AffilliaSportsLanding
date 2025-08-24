import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';
import { validatePlayerRegistration, calculatePlayerAge, type PlayerRegistrationForm } from '@/lib/player-utils';
import { rateLimit } from '@/lib/rate-limit';
import { 
  sanitizeYouthPlayerData, 
  createYouthAuditLog, 
  requiresAdditionalVerification,
  generateSecureYouthToken,
  YOUTH_SECURITY_CONFIG 
} from '@/lib/youth-security';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per minute
});

// Enhanced rate limiting for youth applications
const youthLimiter = rateLimit({
  interval: YOUTH_SECURITY_CONFIG.YOUTH_RATE_LIMIT.windowMs,
  uniqueTokenPerInterval: 100, // Smaller pool for youth applications
});

interface PlayerApplicationRequest {
  name: string;
  email: string;
  phone?: string | null;
  date_of_birth: string;
  position: string;
  experience_level: string;
  application_notes?: string | null;
  cv_file_path?: string | null;
}

interface PlayerApplicationResponse {
  success: boolean;
  application_id?: string;
  message?: string;
  error?: string;
  validation_errors?: Record<string, string>;
}

export async function POST(request: NextRequest): Promise<NextResponse<PlayerApplicationResponse>> {
  const startTime = Date.now();
  let requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    
    // Rate limiting with more specific error messages
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               request.headers.get('cf-connecting-ip') ?? 
               'anonymous';
    
    try {
      await limiter.check(10, ip); // 10 requests per minute per IP
    } catch (rateLimitError) {
      console.warn(`Rate limit exceeded for IP: ${ip} [${requestId}]`);
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests from your location. Please wait 60 seconds before submitting again.',
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-Request-ID': requestId
          }
        }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      console.error(`Player application submission failed: Supabase not configured [${requestId}]`);
      return NextResponse.json(
        {
          success: false,
          error: 'Our registration system is temporarily unavailable. Please try again in a few minutes or contact support if the problem persists.',
        },
        { 
          status: 503,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }

    // Parse request body with detailed error handling
    let requestData: PlayerApplicationRequest;
    try {
      const body = await request.text();
      if (!body || body.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request body is empty. Please ensure all form data is included.',
          },
          { 
            status: 400,
            headers: { 'X-Request-ID': requestId }
          }
        );
      }
      
      requestData = JSON.parse(body);
      
      // Basic structure validation
      if (!requestData || typeof requestData !== 'object') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request format. Please refresh the page and try again.',
          },
          { 
            status: 400,
            headers: { 'X-Request-ID': requestId }
          }
        );
      }
      
    } catch (parseError) {
      console.error(`JSON parsing error [${requestId}]:`, parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data format. Please refresh the page and try submitting again.',
        },
        { 
          status: 400,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }

    // Enhanced server-side validation using Zod schema
    const validation = validatePlayerRegistration({
      name: requestData.name?.trim(),
      email: requestData.email?.trim()?.toLowerCase(),
      phone: requestData.phone?.trim() || null,
      date_of_birth: requestData.date_of_birth,
      position: requestData.position,
      experience_level: requestData.experience_level,
      application_notes: requestData.application_notes?.trim() || null,
      cv_file_path: requestData.cv_file_path || null,
    });

    if (!validation.success) {
      console.warn(`Validation failed [${requestId}]:`, validation.errors);
      
      // Create user-friendly error messages
      const errorCount = Object.keys(validation.errors || {}).length;
      const primaryError = Object.values(validation.errors || {})[0] || 'Validation failed';
      
      return NextResponse.json(
        {
          success: false,
          error: `Please correct ${errorCount} validation error${errorCount > 1 ? 's' : ''} and try again.`,
          validation_errors: validation.errors,
        },
        { 
          status: 400,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }

    const validatedData = validation.data!;

    // Determine if this is a youth application and apply enhanced security
    const ageCalculation = calculatePlayerAge(validatedData.date_of_birth);
    const isYouthApplication = ageCalculation.isYouth;

    // Enhanced rate limiting for youth applications
    if (isYouthApplication) {
      try {
        await youthLimiter.check(YOUTH_SECURITY_CONFIG.YOUTH_RATE_LIMIT.maxSubmissions, ip);
      } catch (youthRateLimitError) {
        console.warn(`Youth application rate limit exceeded for IP: ${ip} [${requestId}]`);
        return NextResponse.json(
          {
            success: false,
            error: 'Too many youth applications from your location. For security reasons, please wait 1 hour before submitting another youth application.',
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '3600', // 1 hour
              'X-Request-ID': requestId
            }
          }
        );
      }
    }

    // Additional verification check for youth applications
    if (isYouthApplication) {
      const verificationCheck = requiresAdditionalVerification(
        validatedData.email,
        validatedData.phone || '',
        validatedData.date_of_birth
      );

      if (verificationCheck.required) {
        console.warn(`Youth application requires additional verification [${requestId}]:`, verificationCheck.reasons);
        return NextResponse.json(
          {
            success: false,
            error: 'Additional verification is required for this youth application. Please ensure you are using valid parent/guardian contact information and try again.',
          },
          { 
            status: 400,
            headers: { 'X-Request-ID': requestId }
          }
        );
      }
    }

    // Enhanced duplicate check with better error handling
    const { data: existingApplication, error: duplicateCheckError } = await safeSupabaseOperation(
      async () => {
        return await supabase
          .from('player_applications')
          .select('id, email, date_of_birth, created_at, name')
          .eq('email', validatedData.email)
          .eq('date_of_birth', validatedData.date_of_birth)
          .single();
      },
      10000
    );

    if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected for new applications
      console.error(`Duplicate check error [${requestId}]:`, duplicateCheckError);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify application uniqueness. Please try again in a moment.',
        },
        { 
          status: 500,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }

    if (existingApplication) {
      const existingDate = new Date(existingApplication.created_at).toLocaleDateString();
      console.warn(`Duplicate application attempt [${requestId}]: ${validatedData.email} - ${validatedData.date_of_birth}`);
      
      return NextResponse.json(
        {
          success: false,
          error: `An application for this player already exists (submitted on ${existingDate}). If you need to update your information, please contact our support team.`,
        },
        { 
          status: 409,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }

    // Prepare application data for database insertion with youth security enhancements
    let applicationData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      date_of_birth: validatedData.date_of_birth,
      position: validatedData.position,
      experience_level: validatedData.experience_level,
      application_notes: validatedData.application_notes,
      cv_file_path: validatedData.cv_file_path,
    };

    // Apply youth-specific data sanitization and security measures
    if (isYouthApplication) {
      applicationData = sanitizeYouthPlayerData(applicationData, true);
      
      // Add youth-specific metadata for enhanced tracking and compliance
      (applicationData as any).metadata = {
        is_youth_application: true,
        requires_parent_consent: true,
        enhanced_privacy: true,
        security_level: 'enhanced',
        submission_timestamp: new Date().toISOString(),
        age_at_submission: ageCalculation.age,
      };
    }

    // Insert application into database with enhanced error handling
    const { data: application, error: insertError } = await safeSupabaseOperation(
      async () => {
        return await supabase
          .from('player_applications')
          .insert(applicationData)
          .select('id, created_at')
          .single();
      },
      15000
    );

    if (insertError || !application) {
      console.error(`Database insertion error [${requestId}]:`, insertError);
      
      // Handle specific database errors with user-friendly messages
      if (insertError?.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'An application with this information already exists. Please check your details or contact support.',
          },
          { 
            status: 409,
            headers: { 'X-Request-ID': requestId }
          }
        );
      }
      
      if (insertError?.code === '23502') {
        return NextResponse.json(
          {
            success: false,
            error: 'Required information is missing. Please ensure all required fields are completed.',
          },
          { 
            status: 400,
            headers: { 'X-Request-ID': requestId }
          }
        );
      }
      
      if (insertError?.code === '23514') {
        return NextResponse.json(
          {
            success: false,
            error: 'Some information provided does not meet our requirements. Please check your entries and try again.',
          },
          { 
            status: 400,
            headers: { 'X-Request-ID': requestId }
          }
        );
      }

      // Generic database error
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to save your application at this time. Please try again in a few moments.',
        },
        { 
          status: 500,
          headers: { 'X-Request-ID': requestId }
        }
      );
    }

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Enhanced logging and audit trail for youth applications
    if (isYouthApplication) {
      const auditLog = createYouthAuditLog(
        application.id,
        'youth_application_submitted',
        {
          age: ageCalculation.age,
          security_level: 'enhanced',
          processing_time_ms: processingTime,
          has_phone: !!validatedData.phone,
          has_cv: !!validatedData.cv_file_path,
        },
        ip
      );
      
      console.log(`Youth application audit log [${requestId}]:`, JSON.stringify(auditLog));
      
      // Generate secure tracking token for youth applications
      const secureToken = generateSecureYouthToken(application.id);
      console.log(`Youth application secure token generated [${requestId}]: ${secureToken}`);
    }
    
    // Log successful submission (without sensitive data)
    const logMessage = isYouthApplication 
      ? `Youth player application submitted successfully [${requestId}]: ${application.id} (${processingTime}ms) - Enhanced security applied`
      : `Player application submitted successfully [${requestId}]: ${application.id} (${processingTime}ms)`;
    
    console.log(logMessage);

    // Customize success message based on application type
    const successMessage = isYouthApplication
      ? 'Youth application submitted successfully! We will review the application and contact the parent/guardian within 48 hours. Enhanced security measures have been applied to protect the youth player\'s information.'
      : 'Application submitted successfully! We will review your application and contact you within 48 hours.';

    return NextResponse.json(
      {
        success: true,
        application_id: application.id,
        message: successMessage,
        ...(isYouthApplication && { 
          security_notice: 'This youth application is subject to enhanced privacy protection and parental consent requirements.' 
        })
      },
      { 
        status: 201,
        headers: { 'X-Request-ID': requestId }
      }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Player application API error [${requestId || 'unknown'}] (${processingTime}ms):`, error);
    
    // Determine error type and provide appropriate response
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with a stable internet connection.';
        statusCode = 408;
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error occurred. Please check your connection and try again.';
        statusCode = 503;
      } else if (error.message.includes('memory') || error.message.includes('resource')) {
        errorMessage = 'Server is temporarily overloaded. Please try again in a few minutes.';
        statusCode = 503;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { 
        status: statusCode,
        headers: { 'X-Request-ID': requestId || 'unknown' }
      }
    );
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}