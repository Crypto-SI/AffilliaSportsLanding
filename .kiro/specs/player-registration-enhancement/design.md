# Player Registration Enhancement Design Document

## Overview

The player registration enhancement extends the existing player application system to support both adult players registering themselves and parents/guardians registering youth players (under 18). The system maintains a unified data structure while providing age-appropriate user experiences and clear guidance on contact information requirements.

The design leverages the existing `player_applications` table structure, adding a `date_of_birth` field to enable age-based logic and proper categorization of applications. The frontend will dynamically adapt based on the calculated age, providing contextual guidance and appropriate form labeling.

## Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   Database      │
│                 │    │                  │    │                 │
│ - Registration  │◄──►│ - Form Handler   │◄──►│ - player_       │
│   Form          │    │ - Validation     │    │   applications  │
│ - Age Logic     │    │ - File Upload    │    │ - File Storage  │
│ - Dynamic UI    │    │ - Error Handling │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **Form Initialization**: User accesses registration form
2. **Age Calculation**: System calculates age based on date of birth input
3. **Dynamic Adaptation**: UI updates labels and instructions based on calculated age
4. **Validation**: Client-side and server-side validation of all inputs
5. **Submission**: Secure transmission and storage of application data
6. **Confirmation**: User receives success confirmation and form resets

## Components and Interfaces

### Database Schema Enhancement

**Enhanced player_applications Table**:
```sql
ALTER TABLE player_applications 
ADD COLUMN date_of_birth DATE NOT NULL;
```

**Rationale**: Adding date_of_birth as a separate field rather than calculating from age allows for precise age calculations at any point in time and supports compliance requirements for youth player management.

### Frontend Components

#### PlayerRegistrationForm Component
- **Purpose**: Main registration form with dynamic behavior based on age
- **Key Features**:
  - Real-time age calculation from date of birth with debounced validation
  - Dynamic label and instruction updates
  - Schema-based validation using Zod for type safety
  - Secure file upload with progress indication and resumable uploads
  - Comprehensive error state management with retry mechanisms

#### Form Validation Schema
```typescript
import { z } from 'zod';

const playerRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  date_of_birth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const age = calculateAge(birthDate);
    return age >= 5 && age <= 65; // Reasonable age range for players
  }, 'Please enter a valid date of birth'),
  position: z.string().min(1, 'Please select a position'),
  experience_level: z.string().min(1, 'Please select experience level'),
  notes: z.string().optional(),
});

type PlayerRegistrationForm = z.infer<typeof playerRegistrationSchema>;
```

#### Age Calculation Logic
```typescript
interface AgeCalculation {
  age: number;
  isYouth: boolean; // under 18
  contactGuidance: string;
  validationRules: {
    requiresParentConsent: boolean;
    contactFieldLabel: string;
    contactFieldPlaceholder: string;
  };
}

const calculatePlayerAge = (dateOfBirth: Date): AgeCalculation => {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const isYouth = age < 18;
  
  return {
    age,
    isYouth,
    contactGuidance: isYouth 
      ? 'Parent/guardian contact information required for players under 18'
      : 'Your contact information',
    validationRules: {
      requiresParentConsent: isYouth,
      contactFieldLabel: isYouth ? 'Parent/Guardian Email' : 'Email',
      contactFieldPlaceholder: isYouth ? 'parent@example.com' : 'your@example.com'
    }
  };
};
```

**Rationale**: Schema-based validation with Zod provides compile-time type safety and runtime validation, while the enhanced age calculation logic supports more sophisticated UI adaptations and business rule enforcement.

### API Interfaces

#### File Upload Configuration
```typescript
// UploadThing file route configuration
const uploadRouter = {
  playerCV: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "2MB", maxFileCount: 1 }
  })
    .middleware(async ({ req }) => {
      // Authentication and rate limiting
      const session = await getSession(req);
      if (!session) {
        throw new UploadThingError("Authentication required");
      }
      
      // Rate limiting for file uploads
      const rateLimit = await checkUploadRateLimit(session.userId);
      if (!rateLimit.allowed) {
        throw new UploadThingError("Upload rate limit exceeded");
      }
      
      return { 
        userId: session.userId,
        uploadedAt: new Date().toISOString()
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Server-side file validation and processing
      await validateFileContent(file);
      await logFileUpload(metadata.userId, file);
      
      return { 
        fileId: file.key,
        secureUrl: file.url,
        uploadedBy: metadata.userId 
      };
    })
};
```

#### Registration Endpoint
```typescript
interface PlayerApplicationRequest {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string; // ISO date format
  position: string;
  experience_level: string;
  notes?: string;
  cv_file_key?: string; // UploadThing file key instead of direct file
}

interface PlayerApplicationResponse {
  success: boolean;
  application_id?: string;
  error?: string;
  validation_errors?: Record<string, string>;
  file_upload_url?: string; // Secure file access URL
}
```

## Data Models

### Player Application Model
```typescript
interface PlayerApplication {
  id: string;
  name: string;
  email: string; // Parent/guardian email for youth players
  phone: string; // Parent/guardian phone for youth players
  date_of_birth: Date;
  position: string;
  experience_level: string;
  notes?: string;
  cv_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Form State Model
```typescript
interface RegistrationFormState {
  formData: PlayerApplicationRequest;
  calculatedAge: number;
  isYouth: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  uploadProgress: number;
}
```

## Error Handling

### Validation Strategy

**Client-Side Validation**:
- Schema-based validation with Zod for type safety and consistent error messages
- Real-time validation with configurable modes (onBlur for better UX, onChange for critical fields)
- File validation using UploadThing helpers (`isValidFileType`, `isValidFileSize`)
- Custom async validation for email uniqueness and business rules
- Age-based conditional validation rules

**Server-Side Validation**:
- Duplicate validation against existing applications with proper indexing
- File security scanning and malware detection in UploadThing middleware
- Input sanitization and SQL injection prevention
- Business rule validation with detailed error context
- Rate limiting for both form submissions and file uploads

### Enhanced Error Categories

1. **Schema Validation Errors**: Type-safe field validation with contextual messages
2. **Upload Errors**: Comprehensive file upload error handling with retry and resume capabilities
3. **Network Errors**: Connection issues with exponential backoff retry mechanisms
4. **Authentication Errors**: Session-based errors with clear re-authentication flows
5. **Rate Limiting Errors**: User-friendly messages with retry timing information
6. **Server Errors**: Sanitized error messages with correlation IDs for debugging

**Rationale**: Schema-based validation ensures type safety and consistency, while UploadThing's built-in security features provide robust file handling. Enhanced error categorization supports better user experience and debugging capabilities.

### Error Recovery and Resilience

- **Form State Persistence**: Automatic form data preservation using React Hook Form's built-in state management
- **Resumable Uploads**: UploadThing's resumable upload capability for large files and poor connections
- **Optimistic Updates**: Immediate UI feedback with rollback on failure
- **Progressive Enhancement**: Graceful degradation with server-side form handling fallback
- **Contextual Error Messages**: Age-appropriate and role-specific error guidance
- **Retry Strategies**: Smart retry logic with exponential backoff for transient failures

## Testing Strategy

### Unit Testing
- Age calculation logic validation
- Form validation functions
- Error handling scenarios
- File upload utilities

### Integration Testing
- Form submission end-to-end flow
- Database integration with new schema
- File upload and storage integration
- API endpoint validation

### User Experience Testing
- Age-based UI adaptation behavior
- Form validation user experience
- Error state handling
- Mobile responsiveness
- Accessibility compliance

### Edge Case Testing
- Boundary age testing (exactly 18 years old)
- Large file uploads
- Network interruption scenarios
- Invalid date inputs
- Concurrent form submissions

**Rationale**: Comprehensive testing ensures the dynamic age-based behavior works correctly and that the enhanced system maintains reliability while adding new functionality.

## Security Considerations

### Data Protection
- Secure transmission of personal data (HTTPS)
- Input sanitization and validation
- File upload security (type validation, virus scanning)
- Protection against injection attacks

### Youth Player Protection
- Clear indication of parent/guardian contact requirements
- Appropriate data handling for minors
- Compliance with youth protection regulations

### File Security
- File type whitelist enforcement
- File size limitations
- Secure file storage with access controls
- Malware scanning for uploaded files

**Rationale**: Enhanced security measures are essential when handling youth player data and ensuring compliance with data protection regulations while maintaining system integrity.

## Performance Considerations

### Frontend Optimization
- Debounced age calculation to avoid excessive recalculation
- Lazy loading of form components
- Optimized file upload with progress indication
- Efficient form state management

### Backend Optimization
- Indexed database queries on date_of_birth for age-based filtering
- Efficient file upload handling with streaming
- Connection pooling for database operations
- Caching strategies for static form data

### Scalability
- Horizontal scaling capability for increased registration volume
- CDN integration for file storage
- Database optimization for growing application data
- Load balancing for high-traffic periods

**Rationale**: Performance optimization ensures the enhanced registration system can handle increased usage while providing a smooth user experience for both adult and youth registrations.