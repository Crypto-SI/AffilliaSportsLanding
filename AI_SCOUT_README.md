# AI Scout Interview System

## Overview

The AI Scout Interview System is an intelligent prospect assessment tool that conducts automated interviews with football prospects. The system generates detailed transcripts and AI-powered recommendations for the Affillia Sports scouting team.

## Features

### 🤖 AI-Powered Interviews
- **Intelligent Conversation**: Uses GPT-4o to conduct natural, professional interviews
- **Contextual Questioning**: Adapts questions based on prospect responses
- **Football-Specific**: Specialized prompts for assessing football potential

### 📝 Comprehensive Recording
- **Real-time Conversation Storage**: Every message saved to database
- **Transcript Generation**: Formatted conversation transcripts uploaded to Supabase Storage
- **Metadata Tracking**: Interview duration, engagement metrics, and timestamps

### 🎯 AI Assessment
- **Professional Evaluation**: AI-generated recommendations using football scouting expertise
- **Scoring System**: 1-10 assessment scores with detailed explanations
- **Tagging System**: Automated categorization (high-potential, moderate-potential, etc.)

### 👥 Admin Interface
- **Interview Management**: View all interviews with filtering and search
- **Detailed Analysis**: Access full transcripts, conversations, and recommendations
- **Performance Metrics**: Statistics dashboard with key insights

## System Architecture

### Database Schema

#### AI Scout Interviews Table
```sql
ai_scout_interviews (
  id UUID PRIMARY KEY,
  prospect_name VARCHAR(255) NOT NULL,
  prospect_email VARCHAR(255),
  prospect_phone VARCHAR(20),
  prospect_age INTEGER,
  prospect_position VARCHAR(100),
  interview_status VARCHAR(50), -- 'in_progress', 'completed', 'abandoned'
  interview_duration_minutes INTEGER,
  conversation_file_path TEXT, -- Path to transcript in storage
  ai_recommendation_text TEXT, -- AI's detailed recommendation
  ai_recommendation_score INTEGER, -- 1-10 scoring
  ai_recommendation_tags TEXT[], -- Categorization tags
  admin_notes TEXT, -- Admin review notes
  metadata JSONB, -- Additional tracking data
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### AI Scout Conversations Table
```sql
ai_scout_conversations (
  id UUID PRIMARY KEY,
  interview_id UUID REFERENCES ai_scout_interviews(id),
  role VARCHAR(20), -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  metadata JSONB, -- Model info, usage stats, etc.
  timestamp TIMESTAMP DEFAULT now()
)
```

### Storage Buckets

#### ai-scout-interviews
- **Purpose**: Store interview transcripts as .txt files
- **Access**: Private (admin only)
- **Naming**: `interview_{interview_id}_{timestamp}.txt`

## API Endpoints

### Public Endpoints

#### POST `/api/ai-scout/start-interview`
Start a new AI scout interview session.

**Request Body:**
```json
{
  "prospect_name": "John Smith",
  "prospect_email": "john@example.com",
  "prospect_phone": "+1234567890",
  "prospect_age": 22,
  "prospect_position": "Midfielder"
}
```

**Response:**
```json
{
  "success": true,
  "interview_id": "uuid-here",
  "message": "Interview started successfully"
}
```

#### POST `/api/ai-scout/chat`
Send a message in an ongoing interview.

**Request Body:**
```json
{
  "interview_id": "uuid-here",
  "message": "I started playing football when I was 8...",
  "prospect_name": "John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "That's great! Tell me more about...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 75,
    "total_tokens": 225
  }
}
```

#### POST `/api/ai-scout/complete-interview`
Complete an interview and generate final assessment.

**Request Body:**
```json
{
  "interview_id": "uuid-here",
  "prospect_name": "John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "interview": { /* interview object */ },
  "recommendation": "Detailed AI assessment...",
  "transcript_uploaded": true,
  "message": "Interview completed successfully"
}
```

### Admin Endpoints

#### GET `/api/ai-scout/admin/interviews`
Retrieve interview data for admin review.

**Query Parameters:**
- `status`: Filter by interview status
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset
- `interview_id`: Get specific interview details

**Response:**
```json
{
  "success": true,
  "interviews": [ /* array of interviews */ ],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 50,
    "hasMore": true
  }
}
```

#### POST `/api/ai-scout/admin/interviews`
Update interview status or add admin notes.

**Request Body:**
```json
{
  "interview_id": "uuid-here",
  "action": "reviewed", // "reviewed", "approved", "rejected", "add_notes"
  "notes": "Admin review notes..."
}
```

## Components

### Frontend Components

#### `AIScoutChat`
Main chat interface component with three states:
1. **Intro Form**: Collect prospect information
2. **Chat Interface**: Real-time conversation with AI scout
3. **Completion Screen**: Success confirmation

**Props:**
```typescript
interface AIScoutChatProps {
  onComplete?: (interviewId: string) => void
}
```

#### `AIScoutSection`
Landing page section that introduces the AI Scout feature.

**Features:**
- Feature overview with icons
- "How it works" explanation
- Full-screen modal integration
- Completion tracking

#### Admin Interface (`/admin/ai-scout`)
Comprehensive admin dashboard for managing interviews.

**Features:**
- Interview list with filtering
- Performance statistics
- Detailed interview viewer
- Export capabilities

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:
```env
# OpenAI Configuration (required)
OPENAI_API_KEY=your-openai-api-key-here

# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Database Migration

Run the AI Scout database migration:
```bash
# Execute: database/migrations/007_create_ai_scout_interviews.sql
```

### 3. Storage Setup

Create the required storage bucket:
1. Go to Supabase Dashboard → Storage
2. Create bucket: `ai-scout-interviews`
3. Set bucket to private
4. Apply the storage policies from the migration

### 4. Install Dependencies

```bash
npm install openai
```

### 5. Add to Main Page

The AI Scout section is already integrated into the main landing page at `/`.

## Usage Flow

### For Prospects

1. **Access**: Navigate to the main site and click "Start AI Scout Interview"
2. **Registration**: Fill in basic information (name, email, position, etc.)
3. **Interview**: Engage in natural conversation with the AI scout
4. **Completion**: Finish when ready (minimum 6 exchanges recommended)
5. **Confirmation**: Receive completion confirmation with interview ID

### For Admins

1. **Access**: Navigate to `/admin/ai-scout` 
2. **Browse**: View all interviews with status filtering
3. **Review**: Click on any interview to see full details
4. **Analyze**: Read AI recommendations and conversation transcripts
5. **Action**: Update interview status and add admin notes

## AI Scout Personality

The AI scout is configured with a professional football scouting personality:

- **Expertise**: 20+ years of football scouting experience
- **Approach**: Professional, encouraging, and knowledgeable
- **Focus Areas**: Technical skills, mental strength, leadership, work ethic
- **Assessment Criteria**: Dedication, coachability, resilience, passion, talent
- **Communication Style**: Conversational, authentic, football-focused

## Security & Privacy

### Data Protection
- **RLS Policies**: Row-level security on all database tables
- **Private Storage**: Interview transcripts stored securely
- **Admin Access**: Only authenticated users can access interview data
- **Data Encryption**: All communication encrypted in transit

### Rate Limiting
Consider implementing rate limiting for:
- Interview creation (prevent spam)
- Message sending (prevent abuse)
- API endpoint access (protect resources)

## Monitoring & Analytics

### Key Metrics
- **Interview Completion Rate**: % of started interviews completed
- **Average Interview Duration**: Time spent in conversations
- **AI Recommendation Distribution**: Score distribution analysis
- **Popular Positions**: Most common prospect positions
- **Engagement Patterns**: Message exchange patterns

### Logging
- All API requests logged with timestamps
- OpenAI usage tracking for cost monitoring
- Error logging for debugging and improvement

## Troubleshooting

### Common Issues

#### OpenAI API Errors
- **Solution**: Verify API key is valid and account has credits
- **Fallback**: System includes error handling with basic assessments

#### Storage Upload Failures
- **Solution**: Check Supabase storage bucket permissions
- **Impact**: Interviews still saved, but transcript may not be available

#### Database Connection Issues
- **Solution**: Verify Supabase credentials and network connectivity
- **Monitoring**: Check application logs for specific error details

### Debug Endpoints

Use these for testing:
- `/api/test` - Basic Supabase connectivity test
- Check browser console for client-side errors
- Monitor Supabase dashboard for database activity

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Conduct interviews in different languages
2. **Video Integration**: Add video call capabilities
3. **Advanced Analytics**: Machine learning insights on prospect success
4. **Integration APIs**: Connect with external scouting platforms
5. **Mobile App**: Dedicated mobile application for prospects

### Scalability Considerations
- **Database Indexing**: Add indexes for frequent queries
- **CDN Integration**: Serve static assets from CDN
- **Load Balancing**: Scale API endpoints for high traffic
- **Caching**: Implement Redis for session management

## Cost Management

### OpenAI Usage
- **Model**: GPT-4o (~$0.03 per 1K tokens)
- **Average Interview**: ~500-1000 tokens ($0.02-0.04 per interview)
- **Monthly Estimate**: 100 interviews = ~$3-4 OpenAI costs

### Supabase Usage
- **Database**: Standard pricing for storage and operations
- **Storage**: File storage for transcripts
- **Bandwidth**: API calls and file transfers

### Optimization Tips
- Use temperature settings to control response creativity
- Implement token limits to prevent excessive usage
- Monitor usage through OpenAI dashboard
- Consider cheaper models for specific operations

---

## Support

For technical support or questions about the AI Scout system:

1. Check this documentation first
2. Review application logs for error details
3. Test individual API endpoints
4. Verify environment configuration
5. Contact development team with specific error messages

**Last Updated**: January 2025
**Version**: 1.0.0 