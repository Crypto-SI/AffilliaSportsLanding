import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as playerApplicationsPost, GET as playerApplicationsGet } from '../../../app/api/player-applications/route';
import { POST as fileUploadPost } from '../../../app/api/player-applications/upload/route';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { id: 'test-application-id' }, 
            error: null 
          }))
        }))
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ 
          data: { path: 'test-path' }, 
          error: null 
        })),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'https://test-url.com/file.pdf' } 
        }))
      }))
    }
  },
  isSupabaseConfigured: true,
  safeSupabaseOperation: vi.fn((operation) => operation())
}));

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => ({
    check: vi.fn(() => Promise.resolve())
  }))
}));

describe('Player Applications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/player-applications', () => {
    it('should successfully create a player application', async () => {
      const validApplicationData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        date_of_birth: '1995-06-15',
        position: 'midfielder',
        experience_level: 'amateur',
        application_notes: 'Looking forward to joining the team',
        cv_file_path: null
      };

      const request = new NextRequest('http://localhost:3000/api/player-applications', {
        method: 'POST',
        body: JSON.stringify(validApplicationData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await playerApplicationsPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.application_id).toBe('test-application-id');
      expect(responseData.message).toContain('Application submitted successfully');
    });

    it('should handle validation errors', async () => {
      const invalidApplicationData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: bad email format
        date_of_birth: '2030-01-01', // Invalid: future date
        position: '',
        experience_level: ''
      };

      const request = new NextRequest('http://localhost:3000/api/player-applications', {
        method: 'POST',
        body: JSON.stringify(invalidApplicationData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await playerApplicationsPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.validation_errors).toBeDefined();
      expect(responseData.error).toContain('validation errors');
    });

    it('should handle youth player application correctly', async () => {
      const youthApplicationData = {
        name: 'Jane Smith',
        email: 'parent@example.com', // Parent email for youth player
        phone: '5551234567', // Valid parent phone number
        date_of_birth: '2010-06-15', // 14 years old
        position: 'forward',
        experience_level: 'youth',
        application_notes: 'Talented young player',
        cv_file_path: null
      };

      const request = new NextRequest('http://localhost:3000/api/player-applications', {
        method: 'POST',
        body: JSON.stringify(youthApplicationData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await playerApplicationsPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.application_id).toBe('test-application-id');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/player-applications', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await playerApplicationsPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('Invalid request data format');
    });

    it('should handle edge case ages', async () => {
      // Test youth age (15 years old) - old enough to not trigger under-13 verification
      const youthAgeData = {
        name: 'Young Player',
        email: 'parent@example.com',
        phone: '5551234567', // Valid parent phone number
        date_of_birth: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        position: 'forward',
        experience_level: 'youth',
        application_notes: null,
        cv_file_path: null
      };

      const request = new NextRequest('http://localhost:3000/api/player-applications', {
        method: 'POST',
        body: JSON.stringify(youthAgeData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await playerApplicationsPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
    });
  });

  describe('POST /api/player-applications/upload', () => {
    it('should successfully upload a valid file', async () => {
      const file = new File(['test content'], 'test-cv.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', 'test-app-id');

      const request = new NextRequest('http://localhost:3000/api/player-applications/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await fileUploadPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.file_path).toBeDefined();
      expect(responseData.file_url).toBeDefined();
    });

    it('should reject invalid file types', async () => {
      const file = new File(['test content'], 'test.exe', { type: 'application/x-executable' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/player-applications/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await fileUploadPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('PDF, DOC, DOCX, or TXT');
    });

    it('should reject files that are too large', async () => {
      // Create a mock file that's too large (11MB)
      const largeContent = 'x'.repeat(11 * 1024 * 1024);
      const file = new File([largeContent], 'large-cv.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/player-applications/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await fileUploadPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('10MB');
    });

    it('should reject empty files', async () => {
      const file = new File([], 'empty.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/player-applications/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await fileUploadPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('empty');
    });

    it('should handle missing file', async () => {
      const formData = new FormData();
      // No file appended

      const request = new NextRequest('http://localhost:3000/api/player-applications/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await fileUploadPost(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('No file provided');
    });
  });

  describe('API Integration', () => {
    it('should handle all supported HTTP methods correctly', async () => {
      // Test GET method (should return 405)
      const getResponse = await playerApplicationsGet();
      const responseData = await getResponse.json();
      
      expect(getResponse.status).toBe(405);
      expect(responseData.error).toBe('Method not allowed');
    });
  });
});