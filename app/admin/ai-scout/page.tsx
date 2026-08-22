'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Select,
  SimpleGrid,
  Divider
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminSession } from '@/lib/admin-auth'

interface Interview {
  id: string
  prospect_name: string
  prospect_email: string
  prospect_phone: string
  prospect_age: number
  prospect_position: string
  interview_status: string
  interview_duration_minutes: number
  ai_recommendation_score: number
  ai_recommendation_text: string
  ai_recommendation_tags: string[]
  conversation_file_path: string
  created_at: string
  updated_at: string
}

interface InterviewDetail extends Interview {
  conversation: any[]
  transcript: string
}

export default function AdminAIScoutPage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useAdminSession()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [selectedInterview, setSelectedInterview] = useState<InterviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!sessionLoading && !session) router.replace('/admin/login')
  }, [sessionLoading, session, router])

  useEffect(() => {
    if (session) fetchInterviews()
  }, [filter, session])

  const fetchInterviews = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const url = filter === 'all' 
        ? '/api/ai-scout/admin/interviews' 
        : `/api/ai-scout/admin/interviews?status=${filter}`
      
      const response = await fetch(url, { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch interviews')
      }

      setInterviews(data.interviews || [])
    } catch (err) {
      console.error('Failed to fetch interviews:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews')
    } finally {
      setLoading(false)
    }
  }

  const viewInterview = async (interviewId: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/ai-scout/admin/interviews?interview_id=${interviewId}`, { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch interview details')
      }

      setSelectedInterview(data)
      onOpen()
    } catch (err) {
      console.error('Failed to fetch interview details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch interview details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green'
      case 'in_progress': return 'blue'
      case 'abandoned': return 'red'
      case 'reviewed': return 'purple'
      case 'approved': return 'green'
      case 'rejected': return 'red'
      default: return 'gray'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'green'
    if (score >= 6) return 'yellow'
    if (score >= 4) return 'orange'
    return 'red'
  }

  if (loading && interviews.length === 0) {
    if (sessionLoading || !session) {
    return (
      <Container maxW="container.xl" py={20} centerContent>
        <Spinner size="xl" />
      </Container>
    )
  }

  return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={8}>
          <Heading>AI Scout Admin</Heading>
          <Spinner size="xl" />
          <Text>Loading interviews...</Text>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>AI Scout Interview Admin</Heading>
          <Text color="gray.600">
            View and manage AI Scout interview records and recommendations
          </Text>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Filters */}
        <HStack spacing={4} wrap="wrap">
          <Text fontWeight="semibold">Filter by status:</Text>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} maxW="200px">
            <option value="all">All Interviews</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="abandoned">Abandoned</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Button onClick={fetchInterviews} colorScheme="blue" size="sm">
            Refresh
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {interviews.length}
              </Text>
              <Text fontSize="sm" color="gray.600">Total Interviews</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {interviews.filter(i => i.interview_status === 'completed').length}
              </Text>
              <Text fontSize="sm" color="gray.600">Completed</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {interviews.filter(i => i.ai_recommendation_score >= 7).length}
              </Text>
              <Text fontSize="sm" color="gray.600">High Potential</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {interviews.reduce((sum, i) => sum + (i.interview_duration_minutes || 0), 0)}
              </Text>
              <Text fontSize="sm" color="gray.600">Total Minutes</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Interviews List */}
        <VStack spacing={4} align="stretch">
          {interviews.map((interview) => (
            <Card key={interview.id} cursor="pointer" onClick={() => viewInterview(interview.id)}>
              <CardBody>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2}>
                    <HStack spacing={3}>
                      <Text fontWeight="bold" fontSize="lg">
                        {interview.prospect_name}
                      </Text>
                      <Badge colorScheme={getStatusColor(interview.interview_status)}>
                        {interview.interview_status}
                      </Badge>
                      <Badge colorScheme={getScoreColor(interview.ai_recommendation_score)}>
                        Score: {interview.ai_recommendation_score}/10
                      </Badge>
                    </HStack>
                    <HStack spacing={4} fontSize="sm" color="gray.600">
                      <Text>📧 {interview.prospect_email}</Text>
                      <Text>⚽ {interview.prospect_position}</Text>
                      <Text>🕐 {interview.interview_duration_minutes} min</Text>
                      <Text>📅 {new Date(interview.created_at).toLocaleDateString()}</Text>
                    </HStack>
                    <HStack spacing={1}>
                      {interview.ai_recommendation_tags?.map((tag, index) => (
                        <Badge key={index} size="sm" variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                  <Button colorScheme="blue" size="sm">
                    View Details
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {interviews.length === 0 && !loading && (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.500">
                No interviews found for the selected filter.
              </Text>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Interview Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Interview Details - {selectedInterview?.prospect_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedInterview && (
              <VStack spacing={6} align="stretch">
                {/* Interview Info */}
                <HStack justify="space-between" wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Prospect Information</Text>
                    <Text>📧 {selectedInterview.prospect_email}</Text>
                    <Text>📞 {selectedInterview.prospect_phone}</Text>
                    <Text>🎂 Age: {selectedInterview.prospect_age}</Text>
                    <Text>⚽ Position: {selectedInterview.prospect_position}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Interview Metrics</Text>
                    <HStack>
                      <Badge colorScheme={getStatusColor(selectedInterview.interview_status)}>
                        {selectedInterview.interview_status}
                      </Badge>
                      <Badge colorScheme={getScoreColor(selectedInterview.ai_recommendation_score)}>
                        Score: {selectedInterview.ai_recommendation_score}/10
                      </Badge>
                    </HStack>
                    <Text>🕐 Duration: {selectedInterview.interview_duration_minutes} minutes</Text>
                    <Text>📅 Date: {new Date(selectedInterview.created_at).toLocaleString()}</Text>
                  </VStack>
                </HStack>

                <Divider />

                {/* AI Recommendation */}
                <Box>
                  <Text fontWeight="semibold" mb={3}>AI Recommendation</Text>
                  <Card>
                    <CardBody>
                      <Text whiteSpace="pre-wrap" fontSize="sm">
                        {selectedInterview.ai_recommendation_text}
                      </Text>
                    </CardBody>
                  </Card>
                </Box>

                {/* Conversation */}
                <Box>
                  <Text fontWeight="semibold" mb={3}>Conversation History</Text>
                  <Card maxH="400px" overflowY="auto">
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {selectedInterview.conversation
                          .filter(msg => msg.role !== 'system')
                          .map((msg, index) => (
                          <Box key={index} p={3} bg={msg.role === 'user' ? 'blue.50' : 'gray.50'} borderRadius="md">
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {msg.role === 'user' ? selectedInterview.prospect_name : 'AI Scout'}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">{msg.content}</Text>
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>

                {/* Transcript */}
                {selectedInterview.transcript && (
                  <Box>
                    <Text fontWeight="semibold" mb={3}>Full Transcript</Text>
                    <Card maxH="300px" overflowY="auto">
                      <CardBody>
                        <Text whiteSpace="pre-wrap" fontSize="sm" fontFamily="mono">
                          {selectedInterview.transcript}
                        </Text>
                      </CardBody>
                    </Card>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 