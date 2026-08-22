import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin-only route. Auth: verified Supabase session cookie must belong to the
// whitelisted admin user. All DB work uses the service-role client after the gate.

const ADMIN_UID = '9624a7c9-48bf-49af-9044-89f5a6970d45' // cryptosi@protonmail.com

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function serviceClient() {
  if (!supabaseUrl || !serviceKey) return null
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
}

/** Verify the caller is the whitelisted admin via their session cookie JWT. */
async function requireAdmin(request: NextRequest): Promise<boolean> {
  const cookies = request.cookies
  const token =
    cookies.get('sb-access-token')?.value ||
    Array.from(cookies.getAll())
      .filter((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
      .map((c) => {
        try {
          const parsed = JSON.parse(c.value)
          return parsed?.access_token || c.value
        } catch {
          return c.value
        }
      })[0] ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token || !supabaseUrl || !anonKey) return false

  // Verify the JWT against GoTrue and check the user id
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) return false
    const user = await res.json()
    return user?.id === ADMIN_UID
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = serviceClient()
    if (!admin) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const interviewId = searchParams.get('interview_id')

    // If requesting a specific interview
    if (interviewId) {
      const interviewResult = await admin
        .from('ai_scout_interviews')
        .select('*')
        .eq('id', interviewId)
        .single()

      if (interviewResult.error) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        )
      }

      // Get conversation history
      const conversationResult = await admin
        .from('ai_scout_conversations')
        .select('*')
        .eq('interview_id', interviewId)
        .order('timestamp', { ascending: true })

      // Get transcript file if available
      let transcriptContent = null
      if (interviewResult.data.conversation_file_path) {
        const transcriptResult = await admin.storage
          .from('ai-scout-interviews')
          .download(interviewResult.data.conversation_file_path)

        if (!transcriptResult.error && transcriptResult.data) {
          transcriptContent = await transcriptResult.data.text()
        }
      }

      return NextResponse.json({
        success: true,
        interview: interviewResult.data,
        conversation: conversationResult.data || [],
        transcript: transcriptContent
      })
    }

    // Get list of interviews
    let query = admin
      .from('ai_scout_interviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('interview_status', status)
    }

    const result = await query

    if (result.error) {
      console.error('Failed to fetch interviews:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch interviews' },
        { status: 500 }
      )
    }

    // Get total count
    const countResult = await admin
      .from('ai_scout_interviews')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      interviews: result.data,
      pagination: {
        total: countResult.count || 0,
        offset,
        limit,
        hasMore: (result.data?.length || 0) === limit
      }
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = serviceClient()
    if (!admin) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { interview_id, action, notes } = body

    if (!interview_id || !action) {
      return NextResponse.json(
        { error: 'Interview ID and action are required' },
        { status: 400 }
      )
    }

    // Update interview with admin notes or actions
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (action === 'reviewed') {
      updateData.interview_status = 'reviewed'
      updateData.admin_notes = notes
    } else if (action === 'approved') {
      updateData.interview_status = 'approved'
      updateData.admin_notes = notes
    } else if (action === 'rejected') {
      updateData.interview_status = 'rejected'
      updateData.admin_notes = notes
    } else if (action === 'add_notes') {
      updateData.admin_notes = notes
    }

    const result = await admin
      .from('ai_scout_interviews')
      .update(updateData)
      .eq('id', interview_id)
      .select()
      .single()

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to update interview' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      interview: result.data,
      message: `Interview ${action} successfully`
    })

  } catch (error) {
    console.error('Admin Update Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
