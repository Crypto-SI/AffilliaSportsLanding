import type { NextRequest } from 'next/server'

/**
 * Shared helpers for the player-applications API: client IP extraction,
 * request IDs, and uniform JSON error/success responses with trace headers.
 */

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'anonymous'
  )
}

export function makeRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  requestId?: string
): Response {
  const headers: Record<string, string> = {}
  if (requestId) headers['X-Request-ID'] = requestId
  if (status === 429) headers['Retry-After'] = '60'
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export const errors = {
  rateLimited: (requestId: string) =>
    jsonResponse(
      {
        success: false,
        error:
          'Too many requests from your location. Please wait 60 seconds before submitting again.',
      },
      429,
      requestId
    ),
  notConfigured: (requestId: string) =>
    jsonResponse(
      {
        success: false,
        error:
          'Our registration system is temporarily unavailable. Please try again in a few minutes or contact support if the problem persists.',
      },
      503,
      requestId
    ),
  badRequest: (message: string, requestId: string) =>
    jsonResponse({ success: false, error: message }, 400, requestId),
  duplicate: (existingDate: string, requestId: string) =>
    jsonResponse(
      {
        success: false,
        error: `An application with this email and date of birth already exists (submitted ${existingDate}). If you believe this is an error, please contact our team.`,
      },
      409,
      requestId
    ),
  serverError: (requestId: string) =>
    jsonResponse(
      {
        success: false,
        error: 'We encountered an unexpected error processing your application. Please try again.',
      },
      500,
      requestId
    ),
}
