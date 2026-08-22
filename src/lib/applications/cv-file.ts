/**
 * CV upload validation shared by the player application form and any future
 * callers. Pure functions — no React, no side effects.
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_FILE_SIZE = 100; // bytes — guards against corrupt/empty stubs
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Full CV file validation. Returns a user-facing error string or null when OK.
 */
export function validateCvFile(file: File): string | null {
  // Empty file
  if (file.size === 0) {
    return 'The selected file appears to be empty. Please choose a valid CV file with content.';
  }

  // Max size
  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File size is ${fileSizeMB}MB, but maximum allowed is 10MB. Please compress your file or choose a smaller file.`;
  }

  // Min size (avoid tiny/corrupt files)
  if (file.size < MIN_FILE_SIZE) {
    return 'File is too small to be a valid CV. Please select a proper CV document.';
  }

  // Extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return 'File must have a valid extension. Please upload a PDF, DOC, DOCX, or TXT file.';
  }
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `File type ".${extension}" is not supported. Please upload a PDF, DOC, DOCX, or TXT file only.`;
  }

  // MIME type cross-check
  if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
    return `File type "${file.type}" is not allowed. Please ensure your file is a valid PDF, DOC, DOCX, or TXT document.`;
  }

  // Filename length
  if (file.name.length > 255) {
    return `File name is ${file.name.length} characters long, but maximum allowed is 255. Please rename your file to be shorter.`;
  }

  // Problematic characters
  const problematicChars = /[<>:"/\\|?*]/;
  if (problematicChars.test(file.name)) {
    const foundChars = file.name.match(problematicChars)?.join(', ') || '';
    return `File name contains invalid characters (${foundChars}). Please rename your file without these special characters.`;
  }

  // Suspicious reserved names (Windows device names)
  const suspiciousPatterns = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  if (suspiciousPatterns.test(nameWithoutExt)) {
    return 'File name is not allowed. Please rename your file and try again.';
  }

  // Overlong base name
  if (nameWithoutExt.length > 200) {
    return 'File name is too long. Please use a shorter, more descriptive name for your CV.';
  }

  // Extension/content mismatch for PDFs
  if (extension === 'pdf' && file.type && !file.type.includes('pdf')) {
    return 'File extension and content type do not match. Please ensure you are uploading a valid PDF file.';
  }

  return null;
}
