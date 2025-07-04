'use client'

import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  Button, 
  Alert, 
  AlertIcon,
  useToast,
  Spinner
} from '@chakra-ui/react'
import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { supabase, type ContactMessage } from '@/lib/supabase'

const MotionBox = motion.create(Box)

interface ContactFormData {
  name: string
  email: string
  subject: string
  phone: string
  message: string
}

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isClient, setIsClient] = useState(false)
  const toast = useToast()

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all required fields')
      setSubmitStatus('error')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please provide a valid email address')
      setSubmitStatus('error')
      return
    }

    // Validate message length
    if (formData.message.length < 10) {
      setErrorMessage('Message must be at least 10 characters long')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Prepare contact message data (same format as the API was using)
      const contactData: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        message: formData.message.trim(),
        subject: formData.subject?.trim() || null,
        phone: formData.phone?.trim() || null,
      }

      // Use direct Supabase client call (same approach as registration form)
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([contactData])
        .select()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        setErrorMessage(`Failed to send message: ${error.message}`)
        setSubmitStatus('error')
        return
      }

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        message: ''
      })
      
      toast({
        title: 'Message sent successfully!',
        description: 'Thank you for your message. We\'ll get back to you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error('Contact form error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      phone: '',
      message: ''
    })
    setSubmitStatus('idle')
    setErrorMessage('')
  }

  // Don't render until client-side to avoid hydration mismatches
  if (!isClient) {
    return (
      <Box id="contact" py={20} bg="white">
        <Container maxW="4xl">
          <VStack spacing={12} align="center">
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="gray.800">
                Get In Touch
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Ready to take your football career to the next level? Contact us today for a consultation.
              </Text>
            </VStack>
            <Box>Loading...</Box>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box id="contact" py={20} bg="white">
      <Container maxW="4xl">
        <VStack spacing={12} align="center">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="gray.800">
                Get In Touch
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Ready to take your football career to the next level? Contact us today for a consultation.
              </Text>
            </VStack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            w="100%"
            maxW="2xl"
          >
            <Box
              as="form"
              onSubmit={handleSubmit}
              bg="gray.50"
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor="gray.200"
            >
              <VStack spacing={6}>
                <HStack spacing={4} w="100%">
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      autoComplete="email"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="100%">
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44 123 456 7890"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Subject</FormLabel>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief subject line"
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      autoComplete="off"
                    />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your football background, goals, and how we can help you..."
                    rows={6}
                    bg="white"
                    border="1px"
                    borderColor="gray.300"
                    _hover={{ borderColor: "gray.400" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                    resize="vertical"
                    autoComplete="off"
                  />
                </FormControl>

                {submitStatus === 'error' && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {errorMessage}
                  </Alert>
                )}

                {submitStatus === 'success' && (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    Thank you for your message! We'll get back to you within 24 hours.
                  </Alert>
                )}

                <HStack spacing={4} w="100%" justifyContent="flex-end">
                  {submitStatus === 'success' && (
                    <Button
                      variant="outline"
                      colorScheme="blue"
                      onClick={resetForm}
                      isDisabled={isSubmitting}
                    >
                      Send Another Message
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Sending..."
                    spinner={<Spinner size="sm" />}
                    isDisabled={!formData.name || !formData.email || !formData.message}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Send Message
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            textAlign="center"
          >
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">
                <strong>Response Time:</strong> We typically respond within 24 hours
              </Text>
              <Text fontSize="sm" color="gray.600">
                <strong>Privacy:</strong> Your information is kept confidential and secure
              </Text>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
} 