'use client';

import React, { useState } from 'react';
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
  Progress,
  HStack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';
import { supabase, safeSupabaseOperation, isSupabaseConfigured, type PlayerApplication } from '@/lib/supabase';

interface PlayerApplicationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
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

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function PlayerApplicationForm({ isOpen, onClose }: PlayerApplicationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    experienceLevel: '',
    applicationNotes: ''
  });
  
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  
  const toast = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        return 'Please upload a PDF, DOC, DOCX, or TXT file only.';
      }
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB.';
    }
    
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    
    setUploadedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    });
  };

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
    
    if (!formData.name || !formData.email || !formData.position || !formData.experienceLevel) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!uploadedFile) {
      setError('Please upload your CV.');
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      setError('Backend service is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      // First, create the application record
      const applicationData: Omit<PlayerApplication, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        position: formData.position,
        experience_level: formData.experienceLevel,
        application_notes: formData.applicationNotes.trim() || null,
        cv_file_path: null, // Will update after file upload
      };

      const { data: application, error: dbError } = await safeSupabaseOperation(
        async () => {
          const result = await supabase
            .from('player_applications')
            .insert(applicationData)
            .select()
            .single();
          return result;
        },
        15000 // 15 second timeout
      );

      if (dbError || !application || !application.id) {
        throw new Error(dbError || 'Failed to create application record');
      }

      // Upload the CV file
      const filePath = await uploadFile(uploadedFile.file, application.id);
      
      if (!filePath) {
        throw new Error('Failed to upload CV file');
      }

      // Update the application record with the file path
      const { error: updateError } = await safeSupabaseOperation(
        async () => {
          const result = await supabase
            .from('player_applications')
            .update({ cv_file_path: filePath })
            .eq('id', application.id);
          return result;
        },
        10000 // 10 second timeout
      );

      if (updateError) {
        console.error('Failed to update file path:', updateError);
        // Don't throw here as the main record was created successfully
      }

      setSuccess(true);
      
      toast({
        title: 'Application Submitted!',
        description: 'Thank you for your application. We will review your CV and contact you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error: any) {
      console.error('Application submission error:', error);
      setError(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      experienceLevel: '',
      applicationNotes: ''
    });
    setUploadedFile(null);
    setError('');
    setSuccess(false);
    setIsLoading(false);
    setUploadProgress(0);
    onClose();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Player Application Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
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

                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    isDisabled={isLoading}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    isDisabled={isLoading}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    isDisabled={isLoading}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Position</FormLabel>
                  <Select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Select your position"
                    isDisabled={isLoading}
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                    <option value="striker">Striker</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    placeholder="Select your experience level"
                    isDisabled={isLoading}
                  >
                    <option value="amateur">Amateur</option>
                    <option value="semi-professional">Semi-Professional</option>
                    <option value="professional">Professional</option>
                    <option value="youth">Youth Player</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    value={formData.applicationNotes}
                    onChange={(e) => setFormData({ ...formData, applicationNotes: e.target.value })}
                    placeholder="Tell us about your career goals, achievements, or any other relevant information"
                    rows={4}
                    isDisabled={isLoading}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Upload CV</FormLabel>
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
                          <Text fontWeight="medium">Click to upload your CV</Text>
                          <Text fontSize="sm" color="gray.500">
                            PDF, DOC, DOCX, or TXT files only (max 10MB)
                          </Text>
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
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Submitting Application..."
                >
                  Submit Application
                </Button>
              </VStack>
            </form>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 