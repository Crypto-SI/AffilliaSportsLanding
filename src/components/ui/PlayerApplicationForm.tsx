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
import { supabase } from '../../lib/supabase';

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
  path: string;
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
    
    // Generate unique file path
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedName}`;
    
    setUploadedFile({
      file,
      path: uniqueFileName,
      name: file.name,
      size: file.size,
      type: file.type
    });
  };

  const uploadFile = async (file: File, path: string): Promise<void> => {
    setUploadProgress(0);
    
    const { error } = await supabase.storage
      .from('player-cvs')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
    
    setUploadProgress(100);
  };

  const submitApplication = async (): Promise<void> => {
    if (!uploadedFile) {
      throw new Error('Please upload your CV first.');
    }

    // Upload file to storage
    await uploadFile(uploadedFile.file, uploadedFile.path);
    
    // Save application to database
    const applicationData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      position: formData.position,
      experience_level: formData.experienceLevel,
      cv_file_path: uploadedFile.path,
      cv_file_name: uploadedFile.name,
      cv_file_size: uploadedFile.size,
      cv_mime_type: uploadedFile.type,
      application_notes: formData.applicationNotes || null,
    };

    const { error } = await supabase
      .from('player_applications')
      .insert([applicationData]);

    if (error) {
      throw new Error(`Application submission failed: ${error.message}`);
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

    setIsLoading(true);
    setError('');
    
    try {
      await submitApplication();
      setSuccess(true);
      
      toast({
        title: 'Application Submitted!',
        description: 'Thank you for your application. We will review your CV and contact you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your application.');
    } finally {
      setIsLoading(false);
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
    setUploadProgress(0);
    onClose();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <Text fontSize="24px" fontWeight="bold" color="blue.600">
            Player Application
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="normal">
            Submit your application to join Affillia Sports
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          {success ? (
            <Box textAlign="center" py={8}>
              <Icon as={FiCheck} boxSize={16} color="green.500" mb={4} />
              <Text fontSize="xl" fontWeight="bold" color="green.500" mb={2}>
                Application Submitted Successfully!
              </Text>
              <Text color="gray.600">
                We will review your application and contact you within 5-7 business days.
              </Text>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Personal Information */}
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isLoading}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </FormControl>

                {/* Playing Information */}
                <FormControl isRequired>
                  <FormLabel>Preferred Position</FormLabel>
                  <Select
                    placeholder="Select your position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    disabled={isLoading}
                  >
                    <option value="goalkeeper">Goalkeeper</option>
                    <option value="defender">Defender</option>
                    <option value="midfielder">Midfielder</option>
                    <option value="forward">Forward</option>
                    <option value="winger">Winger</option>
                    <option value="striker">Striker</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    placeholder="Select your experience level"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    disabled={isLoading}
                  >
                    <option value="youth">Youth/Academy</option>
                    <option value="amateur">Amateur</option>
                    <option value="semi-professional">Semi-Professional</option>
                    <option value="professional">Professional</option>
                    <option value="international">International</option>
                  </Select>
                </FormControl>

                {/* CV Upload */}
                <FormControl isRequired>
                  <FormLabel>Upload Your CV</FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Accepted formats: PDF, DOC, DOCX, TXT (Max: 10MB)
                  </Text>
                  
                  {!uploadedFile ? (
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      p={6}
                      textAlign="center"
                      _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                      cursor="pointer"
                      position="relative"
                    >
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        position="absolute"
                        top={0}
                        left={0}
                        width="100%"
                        height="100%"
                        opacity={0}
                        cursor="pointer"
                        disabled={isLoading}
                      />
                      <Icon as={FiUpload} boxSize={8} color="gray.400" mb={2} />
                      <Text color="gray.600">
                        Click to upload or drag and drop your CV
                      </Text>
                    </Box>
                  ) : (
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4}>
                      <HStack justify="space-between" align="center">
                        <HStack>
                          <Icon as={FiFile} color="blue.500" />
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {uploadedFile.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {formatFileSize(uploadedFile.size)}
                            </Text>
                          </VStack>
                        </HStack>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={removeFile}
                          disabled={isLoading}
                        >
                          <Icon as={FiX} />
                        </Button>
                      </HStack>
                      
                      {uploadProgress > 0 && (
                        <Progress value={uploadProgress} colorScheme="blue" size="sm" mt={2} />
                      )}
                    </Box>
                  )}
                </FormControl>

                {/* Additional Notes */}
                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    placeholder="Tell us about your achievements, goals, or any additional information..."
                    rows={3}
                    value={formData.applicationNotes}
                    onChange={(e) => setFormData({ ...formData, applicationNotes: e.target.value })}
                    disabled={isLoading}
                  />
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Submitting Application..."
                  disabled={!uploadedFile}
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