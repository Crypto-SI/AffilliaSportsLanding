# Player Applications API

This API provides endpoints for handling player application submissions with secure file upload capabilities.

## Endpoints

### POST /api/player-applications

Submit a new player application.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "date_of_birth": "1995-06-15",
  "position": "midfielder",
  "experience_level": "amateur",
  "application_notes": "Looking forward to joining the team",
  "cv_file_path": "applications/cv-file-path.pdf"
}
```

#### Response

**Success (201):**
```json
{
  "success": true,
  "application_id": "uuid-string",
  "message": "Application submitted successfully. We will review your application and contact you soon."
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Please correct the validation errors and try again.",
  "validation_errors": {
    "email": "Please enter a valid email address",
    "date_of_birth": "Please enter a valid date of birth"
  }
}
```

**Duplicate Application (409):**
```json
{
  "success": false,
  "error": "An application with this email and date of birth already exists. Please contact us if you need to update your application."
}
```

**Rate Limited (429):**
```json
{
  "success": false,
  "error": "Too many requests. Please wait a moment before submitting again."
}
```

### POST /api/player-applications/upload

Upload a CV file for a player application.

#### Request

Multipart form data with:
- `file`: The CV file (PDF, DOC, DOCX, or TXT, max 10MB)
- `applicationId`: (optional) The application ID to associate with the file

#### Response

**Success (201):**
```json
{
  "success": true,
  "file_path": "applications/secure-filename.pdf",
  "file_url": "https://storage-url.com/applications/secure-filename.pdf"
}
```

**File Validation Error (400):**
```json
{
  "success": false,
  "error": "Please upload a PDF, DOC, DOCX, or TXT file only."
}
```

**File Too Large (413):**
```json
{
  "success": false,
  "error": "File is too large. Please compress your file or use a different format."
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Submit player application
async function submitPlayerApplication(applicationData: PlayerApplicationRequest) {
  const response = await fetch('/api/player-applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Application submission failed');
  }
  
  return result;
}

// Upload CV file
async function uploadCV(file: File, applicationId?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (applicationId) {
    formData.append('applicationId', applicationId);
  }

  const response = await fetch('/api/player-applications/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'File upload failed');
  }
  
  return result;
}
```

### React Hook Example

```typescript
import { useState } from 'react';

interface UsePlayerApplicationReturn {
  submitApplication: (data: PlayerApplicationRequest) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function usePlayerApplication(): UsePlayerApplicationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitApplication = async (data: PlayerApplicationRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetch('/api/player-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const response = await result.json();
      
      if (!response.success) {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await fetch('/api/player-applications/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await result.json();
      
      if (!response.success) {
        throw new Error(response.error || 'Upload failed');
      }
      
      return response.file_path;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { submitApplication, uploadFile, isLoading, error };
}
```

## Validation Rules

### Player Application Fields

- **name**: 2-100 characters, letters, spaces, hyphens, and apostrophes only
- **email**: Valid email format, max 255 characters
- **phone**: Optional, valid phone number format (10+ digits)
- **date_of_birth**: Valid date, age between 5-65 years
- **position**: Required, max 50 characters
- **experience_level**: Required, max 50 characters
- **application_notes**: Optional, max 1000 characters

### File Upload Rules

- **Allowed types**: PDF, DOC, DOCX, TXT
- **Max size**: 10MB
- **Filename**: Max 255 characters, no special characters
- **Security**: Files are scanned and stored securely

## Age-Based Logic

The API automatically handles age-based logic:

- **Youth players (under 18)**: Contact information is treated as parent/guardian details
- **Adult players (18+)**: Contact information is treated as player's own details
- **Age calculation**: Based on date of birth, accounts for birthday in current year

## Rate Limiting

- **Application submissions**: 10 requests per minute per IP
- **File uploads**: 5 uploads per minute per IP
- **Rate limit exceeded**: Returns 429 status with retry guidance

## Security Features

- Input sanitization and validation
- SQL injection prevention
- File type and size validation
- Secure file storage with unique naming
- Rate limiting protection
- Duplicate application detection
- Error message sanitization

## Error Handling

The API provides comprehensive error handling with:

- Detailed validation error messages
- User-friendly error responses
- Proper HTTP status codes
- Retry guidance for transient errors
- Logging for debugging (without sensitive data)