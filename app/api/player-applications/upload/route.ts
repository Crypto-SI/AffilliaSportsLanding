import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase-admin';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiting configuration for file uploads
const uploadLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Max 100 unique IPs per minute
});

// File validation constants
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadResponse {
  success: boolean;
  file_path?: string;
  file_url?: string;
  error?: string;
}

function validateFile(file: File): string | null {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Please upload a PDF, DOC, DOCX, or TXT file only.';
    }
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be less than 10MB. Please compress your file or use a different format.';
  }

  // Check for empty files
  if (file.size === 0) {
    return 'The selected file appears to be empty. Please choose a valid CV file.';
  }

  // Additional file name validation
  if (file.name.length > 255) {
    return 'File name is too long. Please rename your file to be shorter than 255 characters.';
  }

  // Check for potentially problematic characters in filename
  const problematicChars = /[<>:"/\\|?*]/;
  if (problematicChars.test(file.name)) {
    return 'File name contains invalid characters. Please rename your file and try again.';
  }
  
  return null;
}

function generateSecureFileName(originalName: string, applicationId?: string): string {
  const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'txt';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  if (applicationId) {
    return `${applicationId}-${timestamp}-${randomString}.${fileExtension}`;
  }
  
  return `temp-${timestamp}-${randomString}.${fileExtension}`;
}

export async function POST(request: NextRequest): Promise<NextResponse<FileUploadResponse>> {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               request.headers.get('cf-connecting-ip') ?? 
               'anonymous';
    
    try {
      await uploadLimiter.check(5, ip); // 5 file uploads per minute per IP
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many file uploads. Please wait a moment before uploading again.',
        },
        { status: 429 }
      );
    }

    // Check if Supabase is configured
    if (!isAdminConfigured || !supabaseAdmin) {
      console.error('File upload failed: Supabase not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'File upload service temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file upload format. Please try again.',
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided. Please select a file to upload.',
        },
        { status: 400 }
      );
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    // Generate secure filename
    const secureFileName = generateSecureFileName(file.name, applicationId || undefined);
    const filePath = `applications/${secureFileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('player-cvs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError || !uploadData) {
      console.error('File upload error:', uploadError);
      
      // Handle specific storage errors
      if (uploadError?.message?.includes('Duplicate')) {
        return NextResponse.json(
          {
            success: false,
            error: 'A file with this name already exists. Please rename your file and try again.',
          },
          { status: 409 }
        );
      }

      if (uploadError?.message?.includes('size')) {
        return NextResponse.json(
          {
            success: false,
            error: 'File is too large. Please compress your file or use a different format.',
          },
          { status: 413 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload file. Please try again later.',
        },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabaseAdmin.storage
      .from('player-cvs')
      .getPublicUrl(filePath);

    // Log successful upload (without sensitive data)
    console.log(`File uploaded successfully: ${filePath}`);

    return NextResponse.json(
      {
        success: true,
        file_path: filePath,
        file_url: urlData.publicUrl,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('File upload API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during file upload. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}