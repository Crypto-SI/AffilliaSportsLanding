'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'motion/react';
import { supabase, type MailingListEntry, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';

const MotionButton = motion.create(Button);

interface PlayerRegistrationFormProps {
  trigger?: React.ReactNode;
}

export function PlayerRegistrationForm({ trigger }: PlayerRegistrationFormProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Test connection on component mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
        console.log('Supabase client created:', !!supabase);
        
        // Simple connection test first
        const { data, error } = await supabase
          .from('affillia_mailing_list')
          .select('id', { count: 'exact', head: true });
        
        if (error) {
          console.error('Connection test failed - Full error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          });
        } else {
          console.log('Connection test successful:', data);
        }
      } catch (err) {
        console.error('Connection test exception:', {
          name: (err as any)?.name,
          message: (err as any)?.message,
          stack: (err as any)?.stack,
          fullError: err
        });
      }
    };
    
    testConnection();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Required fields missing',
        description: 'Please enter your name and email address.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add more debugging to check Supabase client status
      console.log('Supabase client check before submission:', {
        isConfigured: isSupabaseConfigured,
        clientExists: !!supabase,
        fromMethod: typeof supabase.from === 'function',
        insertMethod: typeof supabase.from?.('affillia_mailing_list')?.insert === 'function',
      });

      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
      };

      console.log('Submitting data:', submissionData);

      // Let's go back to using the Supabase client but with a simpler approach
      try {
        // First, let's check if we're using the mock client
        if (!isSupabaseConfigured) {
          console.warn('Using mock Supabase client - this will not work with the real database');
        }
        
        // Try a very simple insert without chaining any methods
        let insertError = null;
        
        try {
          const insertResult = await supabase
            .from('affillia_mailing_list')
            .insert([submissionData]);
            
          insertError = insertResult.error;
          console.log('Insert result:', insertResult);
        } catch (e) {
          console.error('Insert threw an exception:', e);
          insertError = e;
        }
        
        if (insertError) {
          console.error('Insert error:', insertError);
          
          // Handle different types of error objects
          let errorMessage = 'Database error occurred';
          
          if (typeof insertError === 'string') {
            errorMessage = insertError;
          } else if (insertError && typeof insertError === 'object') {
            // Check if the error object has a message property
            if (insertError.message) {
              errorMessage = insertError.message;
            } else if (Object.keys(insertError).length === 0) {
              // Empty error object - likely a duplicate email
              errorMessage = 'Email address may already be registered';
            }
          }
          
          toast({
            title: 'Registration failed',
            description: errorMessage,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return; // Exit early
        }
        
        // If we get here, the insert was successful
        console.log('Insert successful!');
      } catch (supabaseError) {
        console.error('Supabase operation error:', supabaseError);
        throw supabaseError;
      }

      toast({
        title: 'Registration successful!',
        description: 'Thank you for registering your interest. We\'ll be in touch soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
      });

      onClose();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <Box onClick={onOpen} cursor="pointer">
          {trigger}
        </Box>
      ) : (
        <MotionButton
          onClick={onOpen}
          size="lg"
          bg="brand.500"
          color="white"
          _hover={{ bg: "brand.600" }}
          borderRadius="md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Register Interest
        </MotionButton>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register Your Interest</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={6} color="neutral.600">
              Join our player performance portal to access exclusive trials, scout evaluations, and development opportunities.
            </Text>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    Phone Number{' '}
                    <Text as="span" color="neutral.500" fontSize="sm">
                      (optional)
                    </Text>
                  </FormLabel>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    focusBorderColor="brand.500"
                  />
                </FormControl>

                <VStack spacing={3} width="full" pt={4}>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Registering..."
                    size="lg"
                    width="full"
                    bg="brand.500"
                    color="white"
                    _hover={{ bg: "brand.600" }}
                    _disabled={{ bg: "neutral.300" }}
                  >
                    Register Interest
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={onClose}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </VStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 