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
  Select,
  SimpleGrid,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Link,
  Icon
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiUser, FiMail, FiPhone, FiCalendar, FiTarget, FiStar, FiFileText, FiDownload, FiEye } from 'react-icons/fi'
import { calculatePlayerAge } from '@/lib/player-utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { PlayerApplication } from '@/lib/types'

interface PlayerApplicationWithAge extends PlayerApplication {
  age: number
  isYouth: boolean
  contactType: string
}

export default function AdminPlayerApplicationsPage() {
  const [applications, setApplications] = useState<PlayerApplicationWithAge[]>([])
  const [selectedApplication, setSelectedApplication] = useState<PlayerApplicationWithAge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    
    if (!isSupabaseConfigured) {
      setError('Database not configured')
      setLoading(false)
      return
    }
    
    try {
      let query = supabase
        .from('player_applications')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filter === 'youth') {
        // We'll filter on the client side since we need to calculate age
      } else if (filter === 'adult') {
        // We'll filter on the client side since we need to calculate age
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Process applications to add age information
      const processedApplications: PlayerApplicationWithAge[] = (data || []).map(app => {
        const ageCalc = calculatePlayerAge(app.date_of_birth)
        return {
          ...app,
          age: ageCalc.age,
          isYouth: ageCalc.isYouth,
          contactType: ageCalc.isYouth ? 'Parent/Guardian' : 'Player'
        }
      })

      // Apply client-side filtering
      let filteredApplications = processedApplications
      if (filter === 'youth') {
        filteredApplications = processedApplications.filter(app => app.isYouth)
      } else if (filter === 'adult') {
        filteredApplications = processedApplications.filter(app => !app.isYouth)
      }

      setApplications(filteredApplications)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const viewApplication = (application: PlayerApplicationWithAge) => {
    setSelectedApplication(application)
    onOpen()
  }

  const getAgeColor = (age: number, isYouth: boolean) => {
    if (isYouth) return 'orange'
    if (age >= 30) return 'blue'
    if (age >= 25) return 'green'
    return 'purple'
  }

  const getExperienceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'professional': return 'green'
      case 'semi-professional': return 'blue'
      case 'amateur': return 'gray'
      case 'youth': return 'orange'
      default: return 'gray'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && applications.length === 0) {
    return (
      <Container maxW="8xl" py={8}>
        <VStack spacing={8}>
          <Heading>Player Applications Admin</Heading>
          <Spinner size="xl" />
          <Text>Loading applications...</Text>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="8xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={4}>Player Applications Admin</Heading>
          <Text color="gray.600">
            View and manage player registration applications with age-based categorization
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
          <Text fontWeight="semibold">Filter by age group:</Text>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} maxW="200px">
            <option value="all">All Applications</option>
            <option value="youth">Youth Players (Under 18)</option>
            <option value="adult">Adult Players (18+)</option>
          </Select>
          <Button onClick={fetchApplications} colorScheme="blue" size="sm">
            Refresh
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {applications.length}
              </Text>
              <Text fontSize="sm" color="gray.600">Total Applications</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {applications.filter(app => app.isYouth).length}
              </Text>
              <Text fontSize="sm" color="gray.600">Youth Players</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {applications.filter(app => !app.isYouth).length}
              </Text>
              <Text fontSize="sm" color="gray.600">Adult Players</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {applications.filter(app => app.experience_level === 'professional').length}
              </Text>
              <Text fontSize="sm" color="gray.600">Professional</Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                {applications.filter(app => app.cv_file_path).length}
              </Text>
              <Text fontSize="sm" color="gray.600">With CV</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <Heading size="md">Applications ({applications.length})</Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Player Name</Th>
                    <Th>Age</Th>
                    <Th>Contact Info</Th>
                    <Th>Position</Th>
                    <Th>Experience</Th>
                    <Th>CV</Th>
                    <Th>Submitted</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {applications.map((app) => (
                    <Tr key={app.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{app.name}</Text>
                          {app.isYouth && (
                            <Badge colorScheme="orange" size="sm">
                              Youth Player
                            </Badge>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getAgeColor(app.age, app.isYouth)}>
                          {app.age} years
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1} fontSize="sm">
                          <HStack>
                            <Icon as={FiMail} />
                            <Text>{app.email}</Text>
                          </HStack>
                          {app.phone && (
                            <HStack>
                              <Icon as={FiPhone} />
                              <Text>{app.phone}</Text>
                            </HStack>
                          )}
                          <Text fontSize="xs" color="gray.500">
                            ({app.contactType})
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge variant="outline">
                          {app.position}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getExperienceColor(app.experience_level)}>
                          {app.experience_level}
                        </Badge>
                      </Td>
                      <Td>
                        {app.cv_file_path ? (
                          <Badge colorScheme="green">
                            <Icon as={FiFileText} mr={1} />
                            Available
                          </Badge>
                        ) : (
                          <Badge colorScheme="gray">
                            None
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {formatDate(app.created_at!)}
                        </Text>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FiEye />}
                          onClick={() => viewApplication(app)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {applications.length === 0 && !loading && (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500">
                  No applications found for the selected filter.
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Application Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Application Details - {selectedApplication?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedApplication && (
              <VStack spacing={6} align="stretch">
                {/* Application Status */}
                <HStack justify="space-between" wrap="wrap">
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{selectedApplication.name}</Heading>
                    <HStack spacing={2}>
                      <Badge colorScheme={getAgeColor(selectedApplication.age, selectedApplication.isYouth)} size="lg">
                        {selectedApplication.age} years old
                      </Badge>
                      {selectedApplication.isYouth && (
                        <Badge colorScheme="orange" size="lg">
                          Youth Player
                        </Badge>
                      )}
                      <Badge colorScheme={getExperienceColor(selectedApplication.experience_level)} size="lg">
                        {selectedApplication.experience_level}
                      </Badge>
                    </HStack>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Submitted: {formatDateTime(selectedApplication.created_at!)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      ID: {selectedApplication.id}
                    </Text>
                  </VStack>
                </HStack>

                <Divider />

                {/* Player Information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card>
                    <CardHeader>
                      <Heading size="sm">
                        <Icon as={FiUser} mr={2} />
                        Player Information
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Text fontWeight="medium" minW="120px">Full Name:</Text>
                          <Text>{selectedApplication.name}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium" minW="120px">Date of Birth:</Text>
                          <Text>{formatDate(selectedApplication.date_of_birth)}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium" minW="120px">Age:</Text>
                          <Text>{selectedApplication.age} years old</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium" minW="120px">Position:</Text>
                          <Badge variant="outline">{selectedApplication.position}</Badge>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium" minW="120px">Experience:</Text>
                          <Badge colorScheme={getExperienceColor(selectedApplication.experience_level)}>
                            {selectedApplication.experience_level}
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="sm">
                        <Icon as={FiMail} mr={2} />
                        Contact Information
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Contact Type:</Text>
                          <Badge colorScheme={selectedApplication.isYouth ? "orange" : "blue"}>
                            {selectedApplication.contactType}
                          </Badge>
                        </VStack>
                        <HStack>
                          <Text fontWeight="medium" minW="80px">Email:</Text>
                          <Link href={`mailto:${selectedApplication.email}`} color="blue.500">
                            {selectedApplication.email}
                          </Link>
                        </HStack>
                        {selectedApplication.phone && (
                          <HStack>
                            <Text fontWeight="medium" minW="80px">Phone:</Text>
                            <Link href={`tel:${selectedApplication.phone}`} color="blue.500">
                              {selectedApplication.phone}
                            </Link>
                          </HStack>
                        )}
                        {selectedApplication.isYouth && (
                          <Alert status="info" size="sm">
                            <AlertIcon />
                            <Text fontSize="sm">
                              Contact information belongs to parent/guardian for this youth player
                            </Text>
                          </Alert>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Application Notes */}
                {selectedApplication.application_notes && (
                  <Card>
                    <CardHeader>
                      <Heading size="sm">
                        <Icon as={FiFileText} mr={2} />
                        Application Notes
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text whiteSpace="pre-wrap" fontSize="sm">
                        {selectedApplication.application_notes}
                      </Text>
                    </CardBody>
                  </Card>
                )}

                {/* CV Information */}
                <Card>
                  <CardHeader>
                    <Heading size="sm">
                      <Icon as={FiFileText} mr={2} />
                      CV/Resume
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    {selectedApplication.cv_file_path ? (
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">CV Available</Text>
                          <Text fontSize="sm" color="gray.600">
                            File: {selectedApplication.cv_file_path}
                          </Text>
                        </VStack>
                        <Button
                          leftIcon={<FiDownload />}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement CV download functionality
                            alert('CV download functionality would be implemented here')
                          }}
                        >
                          Download CV
                        </Button>
                      </HStack>
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        No CV uploaded with this application
                      </Text>
                    )}
                  </CardBody>
                </Card>

                {/* Youth Player Special Notice */}
                {selectedApplication.isYouth && (
                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">Youth Player Application</Text>
                      <Text fontSize="sm">
                        This application is for a player under 18 years old. Enhanced privacy protection 
                        and parental consent requirements apply. All communications must be directed to 
                        the parent/guardian contact information provided.
                      </Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}