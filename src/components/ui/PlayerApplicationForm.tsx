'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { validateCvFile, formatFileSize } from '@/lib/applications/cv-file';
import { FormErrorBoundary } from './FormErrorBoundary';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Center,
  Progress,
  HStack,
  Icon,
  useToast,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { supabase, safeSupabaseOperation, isSupabaseConfigured, type LegacyPlayerApplicationData } from '@/lib/supabase';
import { 
  calculatePlayerAge, 
  validateField, 
  validatePlayerRegistration,
  getAgeValidationError,
  isValidPlayerAge,
  type AgeCalculation,
  type PlayerRegistrationForm 
} from '@/lib/player-utils';
import { 
  validateParentGuardianEmail, 
  validateParentGuardianPhone,
  requiresAdditionalVerification 
} from '@/lib/youth-security';

interface PlayerApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  position: string;
  experienceLevel: string;
  applicationNotes: string;
}

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValidating: boolean;
}

interface ErrorState {
  type: 'validation' | 'network' | 'server' | 'file' | 'rate_limit' | 'duplicate' | 'unknown';
  message: string;
  details?: string;
  retryable: boolean;
  retryCount: number;
  timestamp: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export default function PlayerApplicationForm({ isOpen, onClose }: PlayerApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    position: '',
    experienceLevel: '',
    applicationNotes: ''
  });
  
  const [ageCalculation, setAgeCalculation] = useState<AgeCalculation | null>(null);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    errors: {},
    touched: {},
    isValidating: false
  });
  
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const toast = useToast();

  // Retry configuration
  const retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
  };

  // Enhanced error handling functions
  const createErrorState = useCallback((
    type: ErrorState['type'], 
    message: string, 
    details?: string, 
    retryable: boolean = false
  ): ErrorState => ({
    type,
    message,
    details,
    retryable,
    retryCount: 0,
    timestamp: Date.now()
  }), []);

  const handleError = useCallback((error: any, context: string = 'Unknown') => {
    console.error(`Error in ${context}:`, error);
    
    let errorState: ErrorState;
    
    if (error?.message?.includes('rate limit') || error?.status === 429) {
      errorState = createErrorState(
        'rate_limit',
        'Too many requests. Please wait a moment before trying again.',
        'Rate limit exceeded. Please wait 60 seconds before submitting again.',
        true
      );
    } else if (error?.message?.includes('duplicate') || error?.status === 409) {
      errorState = createErrorState(
        'duplicate',
        'An application with this information already exists.',
        'Please contact us if you need to update your existing application.',
        false
      );
    } else if (error?.message?.includes('network') || error?.name === 'NetworkError') {
      errorState = createErrorState(
        'network',
        'Network connection error. Please check your internet connection and try again.',
        'Unable to connect to the server. Please check your internet connection.',
        true
      );
    } else if (error?.status >= 500 || error?.message?.includes('server')) {
      errorState = createErrorState(
        'server',
        'Server error. Please try again in a few moments.',
        'The server is temporarily unavailable. Please try again later.',
        true
      );
    } else if (error?.message?.includes('validation') || error?.status === 400) {
      errorState = createErrorState(
        'validation',
        'Please correct the form errors and try again.',
        error?.message || 'Form validation failed',
        false
      );
    } else if (error?.message?.includes('file') || error?.message?.includes('upload')) {
      errorState = createErrorState(
        'file',
        'File upload error. Please try uploading a different file.',
        error?.message || 'File upload failed',
        true
      );
    } else {
      errorState = createErrorState(
        'unknown',
        'An unexpected error occurred. Please try again.',
        error?.message || 'Unknown error',
        true
      );
    }
    
    setErrorState(errorState);
    setError(errorState.message);
    
    // Show toast notification
    toast({
      title: 'Error',
      description: errorState.message,
      status: 'error',
      duration: errorState.retryable ? 8000 : 5000,
      isClosable: true,
    });
  }, [createErrorState, toast]);

  const clearError = useCallback(() => {
    setError('');
    setErrorState(null);
  }, []);

  const calculateRetryDelay = useCallback((retryCount: number): number => {
    const delay = Math.min(
      retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, retryCount),
      retryConfig.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [retryConfig]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const retryOperation = useCallback(async (
    operation: () => Promise<any>,
    context: string = 'Operation'
  ): Promise<any> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = calculateRetryDelay(attempt - 1);
          setIsRetrying(true);
          toast({
            title: 'Retrying...',
            description: `Attempting to ${context.toLowerCase()} (${attempt}/${retryConfig.maxRetries})`,
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
          await sleep(delay);
        }
        
        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`${context} attempt ${attempt + 1} failed:`, error);
        
        // Don't retry for certain error types
        if (error?.status === 400 || error?.status === 409 || error?.status === 401 || error?.status === 403) {
          break;
        }
      }
    }
    
    setIsRetrying(false);
    throw lastError;
  }, [retryConfig.maxRetries, calculateRetryDelay, toast]);

  // Comprehensive field validation with age-specific rules
  const validateFormField = useCallback((fieldName: keyof FormData, value: string, currentAgeCalculation?: AgeCalculation | null): string => {
    // Map form field names to schema field names
    const fieldMapping: Record<keyof FormData, keyof PlayerRegistrationForm> = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      dateOfBirth: 'date_of_birth',
      position: 'position',
      experienceLevel: 'experience_level',
      applicationNotes: 'application_notes'
    };

    const schemaFieldName = fieldMapping[fieldName];

    // Handle empty required fields
    const requiredFields: (keyof FormData)[] = ['name', 'email', 'dateOfBirth', 'position', 'experienceLevel'];
    if (requiredFields.includes(fieldName) && !value.trim()) {
      const fieldLabels: Record<keyof FormData, string> = {
        name: currentAgeCalculation?.isYouth ? "Player's name" : 'Name',
        email: currentAgeCalculation?.validationRules.contactFieldLabel || 'Email',
        phone: currentAgeCalculation?.validationRules.phoneFieldLabel || 'Phone',
        dateOfBirth: 'Date of birth',
        position: 'Position',
        experienceLevel: 'Experience level',
        applicationNotes: 'Notes'
      };
      return `${fieldLabels[fieldName]} is required`;
    }

    // Handle optional phone field
    if (fieldName === 'phone' && !value.trim()) {
      return ''; // Phone is optional, no error for empty value
    }

    // Enhanced date of birth validation with specific error messages
    if (fieldName === 'dateOfBirth' && value) {
      try {
        // Check if the date string is in valid format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return 'Please enter date in YYYY-MM-DD format';
        }

        const birthDate = new Date(value);
        const today = new Date();
        
        // Check if date is valid
        if (isNaN(birthDate.getTime())) {
          return 'Please enter a valid date (e.g., 1995-06-15)';
        }

        // Check if date is in the future
        if (birthDate > today) {
          return 'Date of birth cannot be in the future';
        }

        // Check if date is too far in the past (more than 100 years)
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(today.getFullYear() - 100);
        if (birthDate < hundredYearsAgo) {
          return 'Please enter a more recent date of birth';
        }

        // Calculate age for specific validation
        const age = calculatePlayerAge(value).age;
        
        if (age < 5) {
          return 'Player must be at least 5 years old to register. For younger players, please contact us directly.';
        }
        
        if (age > 65) {
          return 'For players over 65, please contact us directly at [email] for specialized registration assistance.';
        }

        // Check for unrealistic dates (e.g., February 30th)
        const reconstructedDate = new Date(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (reconstructedDate.getTime() !== birthDate.getTime()) {
          return 'Please enter a valid calendar date';
        }

      } catch (error) {
        return 'Please enter a valid date of birth in YYYY-MM-DD format';
      }
    }

    // Enhanced validation for youth applications
    if (currentAgeCalculation?.isYouth) {
      if (fieldName === 'email' && value) {
        const youthEmailValidation = validateParentGuardianEmail(value, true);
        if (!youthEmailValidation.isValid) {
          return youthEmailValidation.error || 'Please enter a valid parent/guardian email address';
        }
      }
      
      if (fieldName === 'phone' && value) {
        const youthPhoneValidation = validateParentGuardianPhone(value, true);
        if (!youthPhoneValidation.isValid) {
          return youthPhoneValidation.error || 'Please enter a valid parent/guardian phone number';
        }
      }
    }

    // Use schema validation for detailed field validation
    const fieldValidation = validateField(schemaFieldName, value);
    if (!fieldValidation.isValid && fieldValidation.error) {
      // Customize error messages for better UX
      if (fieldName === 'name' && fieldValidation.error.includes('regex')) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      if (fieldName === 'email' && fieldValidation.error.includes('email')) {
        return currentAgeCalculation?.isYouth 
          ? 'Please enter a valid parent/guardian email address'
          : 'Please enter a valid email address';
      }
      if (fieldName === 'phone' && fieldValidation.error.includes('regex')) {
        return currentAgeCalculation?.isYouth
          ? 'Please enter a valid parent/guardian phone number'
          : 'Please enter a valid phone number';
      }
      return fieldValidation.error;
    }

    return '';
  }, []);

  // Validate entire form
  const validateForm = useCallback((): ValidationState => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const fieldName = key as keyof FormData;
      const error = validateFormField(fieldName, value, ageCalculation);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    // Additional form-level validations
    // TEMPORARILY COMMENTED OUT - CV upload validation
    /*
    if (!uploadedFile) {
      errors.cv = ageCalculation?.isYouth 
        ? "Please upload the player's CV/resume" 
        : 'Please upload your CV';
      isValid = false;
    }
    */

    // Enhanced age-specific validation rules for youth applications
    if (ageCalculation?.isYouth) {
      // Additional verification check for youth applications
      const verificationCheck = requiresAdditionalVerification(
        formData.email,
        formData.phone || '',
        formData.dateOfBirth
      );
      
      if (verificationCheck.required) {
        errors.security = 'Additional verification is required. Please ensure you are using valid parent/guardian contact information.';
        isValid = false;
      }
      
      // Enhanced email validation for youth applications
      if (formData.email && !errors.email) {
        const youthEmailValidation = validateParentGuardianEmail(formData.email, true);
        if (!youthEmailValidation.isValid) {
          errors.email = youthEmailValidation.error || 'Please enter a valid parent/guardian email address';
          isValid = false;
        }
      }
      
      // Enhanced phone validation for youth applications
      if (formData.phone && !errors.phone) {
        const youthPhoneValidation = validateParentGuardianPhone(formData.phone, true);
        if (!youthPhoneValidation.isValid) {
          errors.phone = youthPhoneValidation.error || 'Please enter a valid parent/guardian phone number';
          isValid = false;
        }
      }
    }

    return {
      isValid,
      errors,
      touched: validation.touched,
      isValidating: false
    };
  }, [formData, ageCalculation, uploadedFile, validation.touched, validateFormField]);

  // Real-time validation on field change
  const handleFieldChange = useCallback((fieldName: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true }
    }));

    // Validate field in real-time if it's been touched
    if (validation.touched[fieldName] || value.trim() !== '') {
      const error = validateFormField(fieldName, value, ageCalculation);
      setValidation(prev => ({
        ...prev,
        errors: { ...prev.errors, [fieldName]: error }
      }));
    }
  }, [ageCalculation, validation.touched, validateFormField]);

  // Handle date of birth change with real-time age calculation
  const handleDateOfBirthChange = useCallback((value: string) => {
    handleFieldChange('dateOfBirth', value);
    
    if (value) {
      // Calculate age and update UI guidance
      try {
        const birthDate = new Date(value);
        if (!isNaN(birthDate.getTime()) && isValidPlayerAge(value)) {
          const calculation = calculatePlayerAge(value);
          setAgeCalculation(calculation);
        } else {
          setAgeCalculation(null);
        }
      } catch (error) {
        setAgeCalculation(null);
      }
    } else {
      setAgeCalculation(null);
    }
  }, [handleFieldChange]);

  // Validate form whenever formData or ageCalculation changes
  useEffect(() => {
    const newValidation = validateForm();
    setValidation(prev => ({
      ...newValidation,
      touched: prev.touched // Preserve touched state
    }));
  }, [formData, ageCalculation, uploadedFile]); // Remove validateForm from dependencies to prevent infinite loop

  const validateFile = useCallback((file: File): string | null => validateCvFile(file), []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous file errors
    clearError();
    setValidation(prev => ({
      ...prev,
      errors: { ...prev.errors, cv: '' }
    }));

    try {
      const validationError = validateFile(file);
      if (validationError) {
        const fileError = createErrorState(
          'file',
          validationError,
          `File: ${file.name} (${formatFileSize(file.size)})`,
          false
        );
        
        setErrorState(fileError);
        setError(fileError.message);
        setValidation(prev => ({
          ...prev,
          errors: { ...prev.errors, cv: validationError }
        }));

        // Clear the file input
        event.target.value = '';
        return;
      }

      // File is valid, set it
      setUploadedFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Show success toast for file selection
      toast({
        title: 'File Selected',
        description: `${file.name} (${formatFileSize(file.size)}) is ready for upload.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      const fileError = createErrorState(
        'file',
        'Error processing the selected file. Please try selecting a different file.',
        error instanceof Error ? error.message : 'Unknown file processing error',
        true
      );
      
      setErrorState(fileError);
      setError(fileError.message);
      
      // Clear the file input
      event.target.value = '';
    }
  }, [validateFile, clearError, createErrorState, toast, formatFileSize]);

  const uploadFile = async (file: File, applicationId: string): Promise<string | null> => {
    try {
      setUploadProgress(10);
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${applicationId}-${Date.now()}.${fileExtension}`;
      const filePath = `applications/${fileName}`;
      
      setUploadProgress(30);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('player-cvs')
        .upload(filePath, file);
      
      if (error) {
        console.error('File upload error:', error);
        return null;
      }
      
      setUploadProgress(100);
      return filePath;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    
    // Mark all fields as touched for validation display
    const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof FormData] = true;
      return acc;
    }, {} as Record<keyof FormData, boolean>);
    
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, ...allFieldsTouched }
    }));

    // Perform comprehensive form validation
    const formValidation = validateForm();
    setValidation(formValidation);

    if (!formValidation.isValid) {
      // Show specific error message based on validation errors
      const errorMessages = Object.values(formValidation.errors).filter(Boolean);
      const primaryError = errorMessages[0] || 'Please correct the errors below and try again.';
      
      const validationError = createErrorState(
        'validation',
        primaryError,
        `${errorMessages.length} validation error${errorMessages.length > 1 ? 's' : ''} found`,
        false
      );
      
      setErrorState(validationError);
      setError(validationError.message);
      
      // Show toast with summary of errors
      toast({
        title: 'Form Validation Failed',
        description: `Please correct ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''} and try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Additional server-side validation using the schema
    const schemaValidation = validatePlayerRegistration({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      date_of_birth: formData.dateOfBirth,
      position: formData.position,
      experience_level: formData.experienceLevel,
      application_notes: formData.applicationNotes || undefined
    });

    if (!schemaValidation.success) {
      const schemaErrors = schemaValidation.errors || {};
      setValidation(prev => ({
        ...prev,
        errors: { ...prev.errors, ...schemaErrors }
      }));
      
      const schemaError = createErrorState(
        'validation',
        'Please correct the validation errors and try again.',
        'Schema validation failed',
        false
      );
      
      setErrorState(schemaError);
      setError(schemaError.message);
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      const configError = createErrorState(
        'server',
        'Backend service is not configured. Please contact support.',
        'Supabase configuration missing',
        false
      );
      
      setErrorState(configError);
      setError(configError.message);
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // Submit application with retry mechanism
      await retryOperation(async () => {
        // First, create the application record
        const applicationData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          date_of_birth: formData.dateOfBirth,
          position: formData.position,
          experience_level: formData.experienceLevel,
          application_notes: formData.applicationNotes.trim() || null,
          cv_file_path: null, // Will update after file upload
        };

        // Use API endpoint instead of direct Supabase call for better error handling
        const response = await fetch('/api/player-applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          (error as any).status = response.status;
          (error as any).details = errorData;
          throw error;
        }

        const result = await response.json();
        return result;
      }, 'Submit application');

      setSuccess(true);
      
      toast({
        title: 'Application Submitted Successfully!',
        description: ageCalculation?.isYouth 
          ? 'Thank you for the player application. We will review it and contact the parent/guardian within 48 hours.'
          : 'Thank you for your application. We will review it and contact you within 48 hours.',
        status: 'success',
        duration: 6000,
        isClosable: true,
      });
      
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error: any) {
      handleError(error, 'Application submission');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
      setUploadProgress(0);
    }
  };

  const handleClose = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      position: '',
      experienceLevel: '',
      applicationNotes: ''
    });
    setUploadedFile(null);
    setError('');
    setErrorState(null);
    setSuccess(false);
    setIsLoading(false);
    setIsRetrying(false);
    setUploadProgress(0);
    setAgeCalculation(null);
    setValidation({
      isValid: false,
      errors: {},
      touched: {},
      isValidating: false
    });
    onClose();
  }, [onClose]);

  const removeFile = () => {
    setUploadedFile(null);
    setError('');
  };



  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Player Application Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormErrorBoundary>
          {success ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Application Submitted Successfully!</AlertTitle>
                <AlertDescription>
                  Thank you for your application. Our team will review your CV and contact you within 48 hours.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {errorState && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle fontSize="sm">
                        {errorState.type === 'validation' && 'Form Validation Error'}
                        {errorState.type === 'network' && 'Connection Error'}
                        {errorState.type === 'server' && 'Server Error'}
                        {errorState.type === 'file' && 'File Upload Error'}
                        {errorState.type === 'rate_limit' && 'Rate Limit Exceeded'}
                        {errorState.type === 'duplicate' && 'Duplicate Application'}
                        {errorState.type === 'unknown' && 'Unexpected Error'}
                      </AlertTitle>
                      <AlertDescription fontSize="sm">
                        {errorState.message}
                        {errorState.details && (
                          <Text fontSize="xs" color="red.600" mt={1}>
                            {errorState.details}
                          </Text>
                        )}
                      </AlertDescription>
                      {errorState.retryable && (
                        <HStack mt={2} spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                            isLoading={isLoading || isRetrying}
                            loadingText={isRetrying ? 'Retrying...' : 'Submitting...'}
                            leftIcon={<Icon as={FiAlertCircle} />}
                          >
                            Try Again
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={clearError}
                          >
                            Dismiss
                          </Button>
                        </HStack>
                      )}
                    </Box>
                  </Alert>
                )}

                {isRetrying && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Retrying Submission</AlertTitle>
                      <AlertDescription fontSize="sm">
                        Please wait while we attempt to submit your application again...
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {isLoading && uploadProgress > 0 && (
                  <Box w="full">
                    <Text fontSize="sm" mb={2}>
                      Uploading CV: {uploadProgress}%
                    </Text>
                    <Progress value={uploadProgress} colorScheme="blue" />
                  </Box>
                )}

                <FormControl isRequired isInvalid={validation.touched.name && !!validation.errors.name}>
                  <FormLabel>{ageCalculation?.isYouth ? "Player's Full Name" : "Full Name"}</FormLabel>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, name: true } }))}
                    placeholder={ageCalculation?.isYouth ? "Enter the player's full name" : "Enter your full name"}
                    isDisabled={isLoading}
                    focusBorderColor={validation.errors.name ? "red.500" : "blue.500"}
                  />
                  <FormErrorMessage>{validation.errors.name}</FormErrorMessage>
                  {ageCalculation?.isYouth && !validation.errors.name && (
                    <FormHelperText color="blue.600">
                      Enter the full legal name of the player as it appears on official documents
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={validation.touched.email && !!validation.errors.email}>
                  <FormLabel>{ageCalculation?.validationRules.contactFieldLabel || 'Email Address'}</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, email: true } }))}
                    placeholder={ageCalculation?.validationRules.contactFieldPlaceholder || 'Enter your email address'}
                    isDisabled={isLoading}
                    focusBorderColor={validation.errors.email ? "red.500" : "blue.500"}
                  />
                  <FormErrorMessage>{validation.errors.email}</FormErrorMessage>
                  {ageCalculation?.isYouth && !validation.errors.email && (
                    <FormHelperText color="blue.600">
                      This email will be used for all communications regarding the player's application
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isInvalid={validation.touched.phone && !!validation.errors.phone}>
                  <FormLabel>
                    {ageCalculation?.validationRules.phoneFieldLabel || 'Phone Number'}
                    <Text as="span" color="gray.500" fontSize="sm" ml={1}>(optional)</Text>
                  </FormLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, phone: true } }))}
                    placeholder={ageCalculation?.validationRules.phoneFieldPlaceholder || 'Enter your phone number'}
                    isDisabled={isLoading}
                    focusBorderColor={validation.errors.phone ? "red.500" : "blue.500"}
                  />
                  <FormErrorMessage>{validation.errors.phone}</FormErrorMessage>
                  {ageCalculation?.isYouth && !validation.errors.phone && (
                    <FormHelperText color="blue.600">
                      Please provide parent/guardian contact information for urgent communications
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={validation.touched.dateOfBirth && !!validation.errors.dateOfBirth}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleDateOfBirthChange(e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, dateOfBirth: true } }))}
                    isDisabled={isLoading}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    min="1959-01-01" // Minimum date for 65 year age limit
                    focusBorderColor={validation.errors.dateOfBirth ? "red.500" : "blue.500"}
                  />
                  <FormErrorMessage>{validation.errors.dateOfBirth}</FormErrorMessage>
                  {ageCalculation && !validation.errors.dateOfBirth && (
                    <FormHelperText color="blue.600">
                      <HStack spacing={2}>
                        <Icon as={FiCheck} color="green.500" />
                        <Text>
                          Age: {ageCalculation.age} years old
                          {ageCalculation.isYouth && ' (Youth Player - Parent/Guardian consent required)'}
                        </Text>
                      </HStack>
                    </FormHelperText>
                  )}
                </FormControl>

                {ageCalculation?.contactGuidance && (
                  <Alert status={ageCalculation.isYouth ? "warning" : "info"} borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">
                        {ageCalculation.isYouth ? "Youth Player Application" : "Adult Player Application"}
                      </AlertTitle>
                      <AlertDescription fontSize="sm">
                        {ageCalculation.contactGuidance}
                        {ageCalculation.isYouth && (
                          <VStack align="start" spacing={2} mt={2}>
                            <Text>
                              As this is a youth application, all contact details must be for the parent or guardian who will be the primary contact for communications regarding trials, development opportunities, and other football-related matters.
                            </Text>
                            <Text fontWeight="medium">
                              Important for Youth Applications:
                            </Text>
                            <VStack align="start" spacing={1} pl={4}>
                              <Text>• Parent/guardian consent is required for all activities</Text>
                              <Text>• Contact information must belong to parent/guardian</Text>
                              <Text>• All communications will be directed to the parent/guardian</Text>
                              <Text>• Additional documentation may be required for youth players</Text>
                              <Text color="orange.600" fontWeight="medium">• Enhanced security measures protect youth player data</Text>
                            </VStack>
                            <Alert status="info" size="sm" mt={2}>
                              <AlertIcon />
                              <AlertDescription fontSize="xs">
                                <strong>Privacy & Security:</strong> Youth applications are subject to enhanced data protection measures, 
                                stricter validation requirements, and additional privacy safeguards in compliance with youth protection regulations.
                              </AlertDescription>
                            </Alert>
                          </VStack>
                        )}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                <FormControl isRequired isInvalid={validation.touched.position && !!validation.errors.position}>
                  <FormLabel>Position</FormLabel>
                  <Select
                    value={formData.position}
                    onChange={(e) => handleFieldChange('position', e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, position: true } }))}
                    placeholder={ageCalculation?.isYouth ? "Select player's preferred position" : "Select your position"}
                    isDisabled={isLoading}
                    focusBorderColor={validation.errors.position ? "red.500" : "blue.500"}
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                    <option value="striker">Striker</option>
                  </Select>
                  <FormErrorMessage>{validation.errors.position}</FormErrorMessage>
                  {ageCalculation?.isYouth && !validation.errors.position && (
                    <FormHelperText color="blue.600">
                      Select the position the player most enjoys or performs best in
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={validation.touched.experienceLevel && !!validation.errors.experienceLevel}>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    value={formData.experienceLevel}
                    onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, experienceLevel: true } }))}
                    placeholder={ageCalculation?.isYouth ? "Select player's experience level" : "Select your experience level"}
                    isDisabled={isLoading}
                    focusBorderColor={validation.errors.experienceLevel ? "red.500" : "blue.500"}
                  >
                    <option value="amateur">Amateur</option>
                    <option value="semi-professional">Semi-Professional</option>
                    <option value="professional">Professional</option>
                    <option value="youth">Youth Player</option>
                  </Select>
                  <FormErrorMessage>{validation.errors.experienceLevel}</FormErrorMessage>
                  {ageCalculation?.isYouth && !validation.errors.experienceLevel && (
                    <FormHelperText color="blue.600">
                      Select the experience level that best describes the player's current football background
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isInvalid={validation.touched.applicationNotes && !!validation.errors.applicationNotes}>
                  <FormLabel>
                    Additional Notes
                    <Text as="span" color="gray.500" fontSize="sm" ml={1}>(optional)</Text>
                  </FormLabel>
                  <Textarea
                    value={formData.applicationNotes}
                    onChange={(e) => handleFieldChange('applicationNotes', e.target.value)}
                    onBlur={() => setValidation(prev => ({ ...prev, touched: { ...prev.touched, applicationNotes: true } }))}
                    placeholder={
                      ageCalculation?.isYouth 
                        ? "Tell us about the player's career goals, achievements, current team, or any other relevant information about their football journey"
                        : "Tell us about your career goals, achievements, or any other relevant information"
                    }
                    rows={4}
                    isDisabled={isLoading}
                    focusBorderColor={validation.errors.applicationNotes ? "red.500" : "blue.500"}
                    maxLength={1000}
                  />
                  <FormErrorMessage>{validation.errors.applicationNotes}</FormErrorMessage>
                  {!validation.errors.applicationNotes && (
                    <FormHelperText color="gray.500">
                      {formData.applicationNotes.length}/1000 characters
                      {ageCalculation?.isYouth && (
                        <Text color="blue.600" mt={1}>
                          Include information about current team, school football participation, tournaments played, and development goals
                        </Text>
                      )}
                    </FormHelperText>
                  )}
                </FormControl>

                {/* TEMPORARILY COMMENTED OUT - CV UPLOAD SECTION */}
                {/*
                <FormControl isRequired isInvalid={!!validation.errors.cv}>
                  <FormLabel>{ageCalculation?.isYouth ? "Upload Player's CV/Resume" : "Upload CV"}</FormLabel>
                  <Box>
                    {!uploadedFile ? (
                      <Box
                        border="2px dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        p={8}
                        textAlign="center"
                        cursor={isLoading ? "not-allowed" : "pointer"}
                        _hover={{ borderColor: isLoading ? "gray.300" : "blue.500" }}
                        position="relative"
                        opacity={isLoading ? 0.6 : 1}
                      >
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                          position="absolute"
                          top="0"
                          left="0"
                          width="100%"
                          height="100%"
                          opacity="0"
                          cursor={isLoading ? "not-allowed" : "pointer"}
                          disabled={isLoading}
                        />
                        <VStack spacing={2}>
                          <Icon as={FiUpload} boxSize={8} color="gray.500" />
                          <Text fontWeight="medium">
                            {ageCalculation?.isYouth ? "Click to upload the player's CV/resume" : "Click to upload your CV"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            PDF, DOC, DOCX, or TXT files only (max 10MB)
                          </Text>
                          {ageCalculation?.isYouth && (
                            <Text fontSize="sm" color="blue.600" mt={2}>
                              Include football experience, school teams, achievements, and any relevant training or certifications
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ) : (
                      <Box
                        border="1px solid"
                        borderColor="green.300"
                        borderRadius="md"
                        p={4}
                        bg="green.50"
                      >
                        <HStack justify="space-between">
                          <HStack>
                            <Icon as={FiFile} color="green.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {uploadedFile.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {formatFileSize(uploadedFile.size)}
                              </Text>
                            </VStack>
                          </HStack>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={removeFile}
                            isDisabled={isLoading}
                          >
                            <Icon as={FiX} />
                          </Button>
                        </HStack>
                      </Box>
                    )}
                  </Box>
                  <FormErrorMessage>{validation.errors.cv}</FormErrorMessage>
                  {!validation.errors.cv && !uploadedFile && (
                    <FormHelperText color="gray.500">
                      {ageCalculation?.isYouth 
                        ? "Upload the player's CV, resume, or football profile (PDF, DOC, DOCX, or TXT, max 10MB)"
                        : "Upload your CV, resume, or football profile (PDF, DOC, DOCX, or TXT, max 10MB)"
                      }
                    </FormHelperText>
                  )}
                </FormControl>
                */}

                <VStack spacing={3} width="full" align="center">
                  {/* Form validation summary */}
                  {Object.keys(validation.errors).length > 0 && Object.values(validation.touched).some(Boolean) && (
                    <Alert status="warning" borderRadius="md" size="sm" width="full">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">Please correct the following errors:</AlertTitle>
                        <AlertDescription fontSize="sm">
                          <VStack align="start" spacing={1} mt={1}>
                            {Object.entries(validation.errors)
                              .filter(([key, error]) => error && validation.touched[key as keyof FormData])
                              .map(([key, error]) => (
                                <Text key={key}>• {error}</Text>
                              ))
                            }
                          </VStack>
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={isLoading}
                    loadingText={ageCalculation?.isYouth ? "Submitting Player Application..." : "Submitting Application..."}
                    isDisabled={!validation.isValid && Object.values(validation.touched).some(Boolean)}
                    leftIcon={validation.isValid ? <Icon as={FiCheck} /> : <Icon as={FiAlertCircle} />}
                  >
                    {ageCalculation?.isYouth ? "Submit Player Application" : "Submit Application"}
                  </Button>

                  {/* Age-specific submission guidance */}
                  {ageCalculation?.isYouth && (
                    <Text fontSize="sm" color="blue.600" textAlign="center">
                      By submitting this application, the parent/guardian confirms they have consent to register this player and provide their contact information for football-related communications.
                    </Text>
                  )}
                </VStack>
              </VStack>
            </form>
          )}
          </FormErrorBoundary>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 