import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin';
import { validatePlayerRegistration, calculatePlayerAge } from '@/lib/player-utils';
import { rateLimit } from '@/lib/rate-limit';
import {
  sanitizeYouthPlayerData,
  createYouthAuditLog,
  requiresAdditionalVerification,
  generateSecureYouthToken,
  YOUTH_SECURITY_CONFIG
} from '@/lib/youth-security';
import { getClientIp, makeRequestId } from '@/lib/applications/http';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const youthLimiter = rateLimit({
  interval: YOUTH_SECURITY_CONFIG.YOUTH_RATE_LIMIT.windowMs,
  uniqueTokenPerInterval: 100,
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

function fail(
  body: PlayerApplicationResponse,
  status: number,
  requestId: string,
  retryAfter?: string
): NextResponse<PlayerApplicationResponse> {
  const headers: Record<string, string> = { 'X-Request-ID': requestId };
  if (retryAfter) headers['Retry-After'] = retryAfter;
  return NextResponse.json(body, { status, headers });
}

export async function POST(request: NextRequest): Promise<NextResponse<PlayerApplicationResponse>> {
  const startTime = Date.now();
  const requestId = makeRequestId();

  try {
    const ip = getClientIp(request);

    // 1) Rate limit
    try {
      await limiter.check(10, ip);
    } catch {
      console.warn(`Rate limit exceeded for IP: ${ip} [${requestId}]`);
      return fail(
        {
          success: false,
          error: 'Too many requests from your location. Please wait 60 seconds before submitting again.',
        },
        429,
        requestId,
        '60'
      );
    }

    // 2) Config gate
    if (!isAdminConfigured || !supabaseAdmin) {
      console.error(`Player application submission failed: Supabase not configured [${requestId}]`);
      return fail(
        {
          success: false,
          error: 'Our registration system is temporarily unavailable. Please try again in a few minutes or contact support if the problem persists.',
        },
        503,
        requestId
      );
    }

    // 3) Parse body
    let requestData: PlayerApplicationRequest;
    try {
      const body = await request.text();
      if (!body || body.trim() === '') {
        return fail(
          { success: false, error: 'Request body is empty. Please ensure all form data is included.' },
          400,
          requestId
        );
      }
      requestData = JSON.parse(body);
      if (!requestData || typeof requestData !== 'object') {
        return fail(
          { success: false, error: 'Invalid request format. Please refresh the page and try again.' },
          400,
          requestId
        );
      }
    } catch {
      console.error(`JSON parsing error [${requestId}]`);
      return fail(
        { success: false, error: 'Invalid request data format. Please refresh the page and try submitting again.' },
        400,
        requestId
      );
    }

    // 4) Validate
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
      const errorCount = Object.keys(validation.errors || {}).length;
      const primaryError = Object.values(validation.errors || {})[0] || 'Validation failed';
      return fail(
        {
          success: false,
          error: `Please correct ${errorCount} validation error${errorCount > 1 ? 's' : ''} and try again.`,
          validation_errors: validation.errors,
        },
        400,
        requestId
      );
    }

    const validatedData = validation.data!;

    // 5) Youth security: age, tighter rate limit, additional verification
    const ageCalculation = calculatePlayerAge(validatedData.date_of_birth);
    const isYouth = ageCalculation.isYouth;

    if (isYouth) {
      try {
        await youthLimiter.check(YOUTH_SECURITY_CONFIG.YOUTH_RATE_LIMIT.maxSubmissions, ip);
      } catch {
        console.warn(`Youth application rate limit exceeded for IP: ${ip} [${requestId}]`);
        return fail(
          {
            success: false,
            error: 'Too many youth applications from your location. For security reasons, please wait 1 hour before submitting another youth application.',
          },
          429,
          requestId,
          '3600'
        );
      }

      const verificationCheck = requiresAdditionalVerification(
        validatedData.email,
        validatedData.phone || '',
        validatedData.date_of_birth
      );
      if (verificationCheck.required) {
        console.warn(`Youth application requires additional verification [${requestId}]:`, verificationCheck.reasons);
        return fail(
          {
            success: false,
            error: 'Additional verification is required for this youth application. Please ensure you are using valid parent/guardian contact information and try again.',
          },
          400,
          requestId
        );
      }
    }

    // 6) Duplicate check
    let existingApplication: any = null;
    {
      let result: any;
      try {
        result = await supabaseAdmin
          .from('player_applications')
          .select('id, email, date_of_birth, created_at, name')
          .eq('email', validatedData.email)
          .eq('date_of_birth', validatedData.date_of_birth)
          .maybeSingle();
      } catch (e: any) {
        result = { data: null, error: e };
      }
      if (result.error && result.error.code !== 'PGRST116') {
        console.error(`Duplicate check error [${requestId}]:`, result.error);
        return fail(
          {
            success: false,
            error: 'Unable to verify application uniqueness. Please try again in a moment.',
          },
          500,
          requestId
        );
      }
      existingApplication = result.data;
    }

    if (existingApplication) {
      const existingDate = new Date(existingApplication.created_at).toLocaleDateString();
      console.warn(`Duplicate application attempt [${requestId}]: ${validatedData.email} - ${validatedData.date_of_birth}`);
      return fail(
        {
          success: false,
          error: `An application with this email and date of birth already exists (submitted ${existingDate}). If you believe this is an error, please contact our team.`,
        },
        409,
        requestId
      );
    }

    // 7) Build row (youth sanitization + metadata)
    let applicationData: any = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      date_of_birth: validatedData.date_of_birth,
      position: validatedData.position,
      experience_level: validatedData.experience_level,
      application_notes: validatedData.application_notes,
      cv_file_path: validatedData.cv_file_path,
    };

    if (isYouth) {
      applicationData = sanitizeYouthPlayerData(applicationData, true);
      applicationData.metadata = {
        is_youth_application: true,
        requires_parent_consent: true,
        enhanced_privacy: true,
        security_level: 'enhanced',
        submission_timestamp: new Date().toISOString(),
        age_at_submission: ageCalculation.age,
      };
    }

    // 8) Insert
    const application = await insertApplication(applicationData);

    // 9) Youth audit trail
    const processingTime = Date.now() - startTime;
    if (isYouth) {
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
      const secureToken = generateSecureYouthToken(application.id);
      console.log(`Youth application secure token generated [${requestId}]: ${secureToken}`);
    }

    const logMessage = isYouth
      ? `Youth player application submitted successfully [${requestId}]: ${application.id} (${processingTime}ms) - Enhanced security applied`
      : `Player application submitted successfully [${requestId}]: ${application.id} (${processingTime}ms)`;
    console.log(logMessage);

    const successMessage = isYouth
      ? "Youth application submitted successfully! We will review the application and contact the parent/guardian within 48 hours. Enhanced security measures have been applied to protect the youth player's information."
      : 'Application submitted successfully! We will review your application and contact you within 48 hours.';

    return NextResponse.json(
      {
        success: true,
        application_id: application.id,
        message: successMessage,
        ...(isYouth && {
          security_notice: 'This youth application is subject to enhanced privacy protection and parental consent requirements.',
        }),
      },
      { status: 201, headers: { 'X-Request-ID': requestId } }
    );

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`Player application API error [${requestId}] (${processingTime}ms):`, error);

    // Typed DB errors from insertApplication carry their own status + message
    if (error?.statusCode && error?.clientMessage) {
      return fail({ success: false, error: error.clientMessage }, error.statusCode, requestId);
    }

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

    return fail({ success: false, error: errorMessage }, statusCode, requestId);
  }
}

// Shared insert with the route's exact error-mapping behavior
async function insertApplication(applicationData: any): Promise<{ id: string }> {
  let result: any;
  try {
    result = await supabaseAdmin
      .from('player_applications')
      .insert(applicationData)
      .select('id, created_at')
      .single();
  } catch (e: any) {
    result = { data: null, error: e };
  }

  if (result.error || !result.data) {
    console.error(`Database insertion error:`, result.error);
    const code = result.error?.code;
    if (code === '23505') {
      throw Object.assign(new Error('DUPLICATE_23505'), { statusCode: 409, clientMessage: 'An application with this information already exists. Please check your details or contact support.' });
    }
    if (code === '23502') {
      throw Object.assign(new Error('MISSING_23502'), { statusCode: 400, clientMessage: 'Required information is missing. Please ensure all required fields are completed.' });
    }
    if (code === '23514') {
      throw Object.assign(new Error('INVALID_23514'), { statusCode: 400, clientMessage: 'One or more fields contain invalid data. Please review and try again.' });
    }
    throw Object.assign(new Error('DB_ERROR'), { statusCode: 500, clientMessage: 'Unable to save your application at this time. Please try again in a few minutes.' });
  }
  return result.data;
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
