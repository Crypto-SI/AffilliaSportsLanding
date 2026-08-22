import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin'
import { getAIClient, AI_SCOUT_MODEL } from '@/lib/ai-client'

// AI Scout system prompt
const SYSTEM_PROMPT = `You are an AI Scout for Affillia Sports, a professional football agency. Your role is to conduct interviews with football prospects to assess their potential, personality, and fit for professional football.

INTERVIEW GUIDELINES:
1. Be professional, encouraging, and knowledgeable about football
2. Ask thoughtful questions about their football journey, experiences, and aspirations
3. Explore their technical skills, mental strength, leadership qualities, and work ethic
4. Understand their background, achievements, and challenges they've overcome
5. Assess their potential for professional football and agency representation
6. Keep the conversation flowing naturally - don't rush through questions
7. Show genuine interest in their responses and ask follow-up questions
8. Look for key indicators: dedication, coachability, resilience, passion, and talent

INTERVIEW STRUCTURE:
- Start with a warm welcome and brief introduction
- Ask about their football background and current situation
- Explore their playing experience, positions, and achievements
- Discuss their goals, aspirations, and what they're looking for in representation
- Ask about challenges they've faced and how they overcame them
- Assess their understanding of the professional football landscape
- Conclude when you feel you have enough information for a recommendation

CONVERSATION STYLE:
- Be conversational and engaging, not robotic
- Use football terminology appropriately
- Show enthusiasm for their journey
- Ask one question at a time to maintain natural flow
- Acknowledge their responses before moving to the next topic
- Keep responses concise - typically 2-4 sentences plus one question

Remember: You're evaluating them as a potential client for Affillia Sports. Look for qualities that indicate they could succeed in professional football and would be a good fit for the agency.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { interview_id, message, prospect_name } = body

    if (!interview_id || !message || !prospect_name) {
      return NextResponse.json(
        { error: 'Interview ID, message, and prospect name are required' },
        { status: 400 }
      )
    }

    // Check if AI backend is configured
    const ai = getAIClient()
    if (!ai || !isAdminConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Save user message to database
    const userMessage: any = {
      interview_id,
      role: 'user',
      content: message.trim(),
      metadata: {
        message_type: 'user_input',
        timestamp: new Date().toISOString()
      }
    }

    await supabaseAdmin
      .from('ai_scout_conversations')
      .insert([userMessage])

    // Get conversation history for context
    const conversationResult = await supabaseAdmin
      .from('ai_scout_conversations')
      .select('role, content')
      .eq('interview_id', interview_id)
      .order('timestamp', { ascending: true })

    if (conversationResult.error) {
      console.error('Failed to fetch conversation history:', conversationResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch conversation history' },
        { status: 500 }
      )
    }

    // Build messages for the model
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'system',
        content: `You are interviewing ${prospect_name}. This is their football interview for potential representation by Affillia Sports.`
      }
    ]

    // Add conversation history (excluding system messages)
    const conversationHistory = conversationResult.data || []
    for (const msg of conversationHistory) {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })
      }
    }

    // Generate AI response via OpenRouter
    // NOTE: ox-alpha is a reasoning model - generous token budget so the
    // visible answer isn't starved by reasoning tokens
    const completion = await ai.chat.completions.create({
      model: AI_SCOUT_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I cannot generate a response at this time.'

    // Save AI response to database
    const assistantMessage: any = {
      interview_id,
      role: 'assistant',
      content: aiResponse,
      metadata: {
        message_type: 'ai_response',
        model: AI_SCOUT_MODEL,
        timestamp: new Date().toISOString(),
        usage: completion.usage
      }
    }

    await supabaseAdmin
      .from('ai_scout_conversations')
      .insert([assistantMessage])

    return NextResponse.json({
      success: true,
      message: aiResponse,
      usage: completion.usage
    })

  } catch (error) {
    console.error('AI Scout Chat Error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
