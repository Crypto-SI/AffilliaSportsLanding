import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin'
import { getAIClient, AI_SCOUT_MODEL } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { interview_id, prospect_name } = body

    if (!interview_id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      )
    }

    if (!isAdminConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    // Get full conversation history
    const conversationResult = await supabaseAdmin
      .from('ai_scout_conversations')
      .select('role, content, timestamp')
      .eq('interview_id', interview_id)
      .order('timestamp', { ascending: true })

    if (conversationResult.error) {
      console.error('Failed to fetch conversation:', conversationResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      )
    }

    const messages = conversationResult.data || []
    
    // Create conversation transcript
    const transcript = messages
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => {
        const timestamp = new Date(msg.timestamp).toLocaleString()
        const speaker = msg.role === 'user' ? prospect_name : 'AI Scout'
        return `[${timestamp}] ${speaker}: ${msg.content}`
      })
      .join('\n\n')

    const fullTranscript = `AI SCOUT INTERVIEW TRANSCRIPT
========================================
Prospect: ${prospect_name}
Interview ID: ${interview_id}
Date: ${new Date().toLocaleString()}
Duration: ${Math.round((Date.now() - new Date(messages[0]?.timestamp || Date.now()).getTime()) / 60000)} minutes

CONVERSATION:
${transcript}

========================================
End of Interview`

    // Upload transcript to Supabase Storage
    const fileName = `interview_${interview_id}_${Date.now()}.txt`
    const uploadResult = await supabaseAdmin.storage
      .from('ai-scout-interviews')
      .upload(fileName, fullTranscript, {
        contentType: 'text/plain',
        upsert: false
      })

    if (uploadResult.error) {
      console.error('Failed to upload transcript:', uploadResult.error)
    }

    // Generate AI recommendation using OpenAI
    const conversationLength = messages.filter((m: any) => m.role !== 'system').length
    const conversationText = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => `${m.role === 'user' ? 'Prospect' : 'Scout'}: ${m.content}`)
      .join('\n')

    let aiRecommendation = ''
    let recommendationScore = 5

    const ai = getAIClient()
    if (ai) {
      try {
        const recommendationPrompt = `As a professional football scout, analyze this interview transcript and provide a comprehensive assessment:

INTERVIEW TRANSCRIPT:
${conversationText}

PROSPECT: ${prospect_name}
INTERVIEW DURATION: ${Math.round((Date.now() - new Date(messages[0]?.timestamp || Date.now()).getTime()) / 60000)} minutes

Please provide a detailed assessment covering:
1. OVERALL IMPRESSION (1-10 score)
2. KEY STRENGTHS identified
3. AREAS OF CONCERN (if any)
4. POTENTIAL FOR PROFESSIONAL FOOTBALL
5. RECOMMENDATION for Affillia Sports
6. SUGGESTED NEXT STEPS

Be honest, professional, and constructive in your assessment. Focus on football potential, character, communication skills, and fit for professional representation.`

        const completion = await ai.chat.completions.create({
          model: AI_SCOUT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a professional football scout with 20+ years of experience evaluating prospects for top-tier representation. Provide detailed, honest assessments based on interview conversations. Always include an overall impression score formatted as "X/10".'
            },
            {
              role: 'user',
              content: recommendationPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })

        aiRecommendation = completion.choices[0]?.message?.content || 'Unable to generate recommendation at this time.'
        
        // Extract score from recommendation (look for X/10 pattern)
        const scoreMatch = aiRecommendation.match(/(\d+)\/10/)
        if (scoreMatch) {
          recommendationScore = parseInt(scoreMatch[1])
        }

      } catch (error) {
        console.error('Failed to generate AI recommendation:', error)
        aiRecommendation = `Basic Assessment for ${prospect_name}:
        
Interview completed with ${conversationLength} exchanges over ${Math.round((Date.now() - new Date(messages[0]?.timestamp || Date.now()).getTime()) / 60000)} minutes.

Due to technical limitations, a full AI assessment could not be generated at this time. Manual review of the interview transcript is recommended.

This prospect showed engagement by participating in a structured interview process, demonstrating basic communication skills and interest in professional football representation.`
      }
    } else {
      aiRecommendation = `Assessment for ${prospect_name}:
      
Interview completed with ${conversationLength} exchanges. OpenAI integration not configured - manual review required.

The prospect demonstrated engagement by completing the interview process and answering questions about their football journey.`
    }

    // Update interview record with completion data
    const updateData = {
      interview_status: 'completed' as const,
      interview_duration_minutes: Math.round((Date.now() - new Date(messages[0]?.timestamp || Date.now()).getTime()) / 60000),
      conversation_file_path: uploadResult.error ? null : fileName,
      ai_recommendation_text: aiRecommendation,
      ai_recommendation_score: recommendationScore,
      ai_recommendation_tags: [
        recommendationScore > 7 ? 'high-potential' : recommendationScore > 4 ? 'moderate-potential' : 'low-potential',
        'communication-assessed',
        'initial-screening'
      ],
      metadata: {
        completed_at: new Date().toISOString(),
        message_count: conversationLength,
        transcript_uploaded: !uploadResult.error
      }
    }

    const updateResult = await supabaseAdmin
      .from('ai_scout_interviews')
      .update(updateData)
      .eq('id', interview_id)
      .select()
      .single()

    if (updateResult.error) {
      console.error('Failed to update interview:', updateResult.error)
      return NextResponse.json(
        { error: 'Failed to complete interview' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      interview: updateResult.data,
      recommendation: aiRecommendation,
      transcript_uploaded: !uploadResult.error,
      message: 'Interview completed successfully'
    })

  } catch (error) {
    console.error('Complete Interview Error:', error)
    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    )
  }
} 