import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prospect_name, prospect_email, prospect_phone, prospect_age, prospect_position } = body

    if (!prospect_name || prospect_name.trim() === '') {
      return NextResponse.json(
        { error: 'Prospect name is required' },
        { status: 400 }
      )
    }

    // Create new interview record
    const interviewData: any = {
      prospect_name: prospect_name.trim(),
      prospect_email: prospect_email?.trim() || null,
      prospect_phone: prospect_phone?.trim() || null,
      prospect_age: prospect_age ? parseInt(prospect_age) : null,
      prospect_position: prospect_position?.trim() || null,
      interview_status: 'in_progress',
      metadata: {
        started_at: new Date().toISOString(),
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    }

    if (!isAdminConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }
    const result = await supabaseAdmin
      .from('ai_scout_interviews')
      .insert([interviewData])
      .select()
      .single()

    if (result.error) {
      console.error('Failed to create interview:', result.error)
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create interview' },
        { status: 500 }
      )
    }

    const interview = result.data
    console.log('New interview created:', interview?.id)

    // Create initial system message
    const systemMessage = {
      interview_id: interview.id,
      role: 'system' as const,
      content: `AI Scout Interview started for ${prospect_name}. Welcome to Affillia Sports - I'm here to learn about your football journey and potential.`,
      metadata: {
        message_type: 'system_init'
      }
    }

    await supabaseAdmin
      .from('ai_scout_conversations')
      .insert([systemMessage])

    return NextResponse.json({
      success: true,
      interview_id: interview.id,
      message: 'Interview started successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 