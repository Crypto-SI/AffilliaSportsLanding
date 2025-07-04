'use client'

import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Container,
  Heading,
  FormControl,
  FormLabel,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  Avatar,
  Card,
  CardBody,
  Badge,
  Textarea,
  useToast
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'

const MotionBox = motion(Box)

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

interface AIScoutChatProps {
  onComplete?: (interviewId: string) => void
}

export default function AIScoutChat({ onComplete }: AIScoutChatProps) {
  const [step, setStep] = useState<'intro' | 'chat' | 'completed'>('intro')
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data for starting interview
  const [prospectName, setProspectName] = useState('')
  const [prospectEmail, setProspectEmail] = useState('')
  const [prospectPhone, setProspectPhone] = useState('')
  const [prospectAge, setProspectAge] = useState('')
  const [prospectPosition, setProspectPosition] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startInterview = async () => {
    if (!prospectName.trim()) {
      setError('Name is required to start the interview')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-scout/start-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prospect_name: prospectName,
          prospect_email: prospectEmail,
          prospect_phone: prospectPhone,
          prospect_age: prospectAge,
          prospect_position: prospectPosition
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start interview')
      }

      setInterviewId(data.interview_id)
      setStep('chat')
      
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: `Hello ${prospectName}! Welcome to Affillia Sports. I'm excited to learn about your football journey. Could you start by telling me a bit about yourself and how you got into football?`,
        timestamp: new Date().toISOString()
      }])

      toast({
        title: 'Interview Started',
        description: 'Your AI scout interview has begun!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

    } catch (err) {
      console.error('Failed to start interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to start interview')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !interviewId || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-scout/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interview_id: interviewId,
          message: userMessage.content,
          prospect_name: prospectName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (err) {
      console.error('Failed to send message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const completeInterview = async () => {
    if (!interviewId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-scout/complete-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interview_id: interviewId,
          prospect_name: prospectName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete interview')
      }

      setStep('completed')
      onComplete?.(interviewId)

      toast({
        title: 'Interview Completed',
        description: 'Your interview has been processed and saved!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

    } catch (err) {
      console.error('Failed to complete interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete interview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (step === 'intro') {
    return (
      <Container maxW="md" py={8}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                  <Heading size="lg" color="blue.600" mb={2}>
                    AI Scout Interview
                  </Heading>
                  <Text color="gray.600">
                    Welcome to Affillia Sports! Our AI scout will conduct a brief interview 
                    to learn about your football journey and potential.
                  </Text>
                </Box>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      value={prospectName}
                      onChange={(e) => setProspectName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={prospectEmail}
                        onChange={(e) => setProspectEmail(e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Input
                        value={prospectPhone}
                        onChange={(e) => setProspectPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Age</FormLabel>
                      <Input
                        type="number"
                        value={prospectAge}
                        onChange={(e) => setProspectAge(e.target.value)}
                        placeholder="18"
                        min="16"
                        max="35"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Primary Position</FormLabel>
                      <Input
                        value={prospectPosition}
                        onChange={(e) => setProspectPosition(e.target.value)}
                        placeholder="e.g., Midfielder, Striker"
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>

                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={startInterview}
                  isLoading={isLoading}
                  loadingText="Starting Interview..."
                >
                  Start AI Scout Interview
                </Button>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  The interview typically takes 5-10 minutes. Be honest and detailed 
                  in your responses for the best assessment.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    )
  }

  if (step === 'completed') {
    return (
      <Container maxW="md" py={8}>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardBody p={8} textAlign="center">
              <VStack spacing={6}>
                <Box>
                  <Text fontSize="4xl">🎉</Text>
                  <Heading size="lg" color="green.600" mt={2}>
                    Interview Completed!
                  </Heading>
                </Box>
                
                <Text color="gray.600">
                  Thank you for taking the time to complete your AI scout interview, {prospectName}! 
                  Your responses have been recorded and our team will review your profile.
                </Text>

                <VStack spacing={3}>
                  <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                    Interview ID: {interviewId?.slice(-8)}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    Your conversation transcript and AI recommendation have been saved securely.
                  </Text>
                </VStack>

                <Text color="gray.600" fontSize="sm">
                  We'll be in touch if we'd like to move forward with your application.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    )
  }

  // Chat interface
  return (
    <Container maxW="2xl" py={4}>
      <VStack spacing={4} h="80vh">
        {/* Header */}
        <Box w="full" textAlign="center" py={4}>
          <Heading size="md" color="blue.600">
            AI Scout Interview with {prospectName}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Interview ID: {interviewId?.slice(-8)}
          </Text>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Messages */}
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          bg="gray.50"
        >
          <VStack spacing={4} align="stretch">
            {messages.map((message, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <HStack spacing={3} align="start">
                  <Avatar
                    size="sm"
                    name={message.role === 'user' ? prospectName : 'AI Scout'}
                    bg={message.role === 'user' ? 'blue.500' : 'green.500'}
                  />
                  <Box flex={1}>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.600" mb={1}>
                      {message.role === 'user' ? prospectName : 'AI Scout'}
                    </Text>
                    <Box
                      bg={message.role === 'user' ? 'blue.100' : 'white'}
                      p={3}
                      borderRadius="lg"
                      border="1px"
                      borderColor={message.role === 'user' ? 'blue.200' : 'gray.200'}
                    >
                      <Text>{message.content}</Text>
                    </Box>
                  </Box>
                </HStack>
              </MotionBox>
            ))}
            
            {isLoading && (
              <HStack spacing={3} align="start">
                <Avatar size="sm" name="AI Scout" bg="green.500" />
                <Box flex={1}>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.600" mb={1}>
                    AI Scout
                  </Text>
                  <Box bg="white" p={3} borderRadius="lg" border="1px" borderColor="gray.200">
                    <HStack spacing={2}>
                      <Spinner size="sm" />
                      <Text color="gray.500">Thinking...</Text>
                    </HStack>
                  </Box>
                </Box>
              </HStack>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>
        </Box>

        {/* Input */}
        <HStack spacing={3} w="full">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            resize="none"
            rows={2}
            disabled={isLoading}
          />
          <VStack spacing={2}>
            <Button
              colorScheme="blue"
              onClick={sendMessage}
              isLoading={isLoading}
              disabled={!currentMessage.trim()}
              size="sm"
            >
              Send
            </Button>
            <Button
              colorScheme="green"
              variant="outline"
              onClick={completeInterview}
              size="sm"
              disabled={messages.length < 6}
            >
              Complete
            </Button>
          </VStack>
        </HStack>

        <Text fontSize="xs" color="gray.500" textAlign="center">
          {messages.length < 6 
            ? `Continue the conversation... (${Math.max(0, 6 - messages.length)} more exchanges recommended)`
            : 'You can complete the interview when ready or continue the conversation.'
          }
        </Text>
      </VStack>
    </Container>
  )
} 