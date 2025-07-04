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
import { supabase, type MailingListEntry } from '@/lib/supabase';

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
      const submissionData: Omit<MailingListEntry, 'id' | 'created_at'> = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
      };

      const { data, error } = await supabase
        .from('affillia_mailing_list')
        .insert([submissionData])
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        toast({
          title: 'Registration failed',
          description: `Error: ${error.message || 'Database connection failed'}`,
          status: 'error',
          duration: 8000,
          isClosable: true,
        });
        return;
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