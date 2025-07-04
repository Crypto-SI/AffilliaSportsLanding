import { NextRequest, NextResponse } from 'next/server'
import { supabase, handleSupabaseError, safeSupabaseOperation } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const interviewId = searchParams.get('interview_id')

    // If requesting a specific interview
    if (interviewId) {
      const interviewResult = await safeSupabaseOperation(
        () => supabase
          .from('ai_scout_interviews')
          .select('*')
          .eq('id', interviewId)
          .single()
      ) as any

      if (interviewResult.error) {
        return NextResponse.json(
          { error: 'Interview not found' },
          { status: 404 }
        )
      }

      // Get conversation history
      const conversationResult = await safeSupabaseOperation(
        () => supabase
          .from('ai_scout_conversations')
          .select('*')
          .eq('interview_id', interviewId)
          .order('timestamp', { ascending: true })
      ) as any

      // Get transcript file if available
      let transcriptContent = null
      if (interviewResult.data.conversation_file_path) {
        const transcriptResult = await safeSupabaseOperation(
          () => supabase.storage
            .from('ai-scout-interviews')
            .download(interviewResult.data.conversation_file_path)
        ) as any

        if (!transcriptResult.error) {
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
    let query = supabase
      .from('ai_scout_interviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('interview_status', status)
    }

    const result = await safeSupabaseOperation(() => query) as any

    if (result.error) {
      console.error('Failed to fetch interviews:', result.error)
      return NextResponse.json(
        { error: 'Failed to fetch interviews' },
        { status: 500 }
      )
    }

    // Get total count
    const countResult = await safeSupabaseOperation(
      () => supabase
        .from('ai_scout_interviews')
        .select('id', { count: 'exact', head: true })
        .eq('interview_status', status || '')
    ) as any

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

    const result = await safeSupabaseOperation(
      () => supabase
        .from('ai_scout_interviews')
        .update(updateData)
        .eq('id', interview_id)
        .select()
        .single()
    ) as any

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