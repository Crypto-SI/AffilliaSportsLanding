'use client'

import { Box, Container, Heading, Text, VStack, Badge, HStack } from '@chakra-ui/react'
import { motion } from 'motion/react'

const MotionBox = motion(Box)

export default function AIScoutSection() {
  return (
    <Box id="ai-scout" py={20} bg="gradient-to-br from-blue-50 to-green-50">
      <Container maxW="6xl">
        <VStack spacing={12} align="center" textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <VStack spacing={6}>
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
                AI-Powered Scouting
              </Badge>
              <Heading size="2xl" color="gray.800">
                Meet Your AI Scout
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl">
                Experience the future of football scouting with our AI-powered interview system. 
                Our intelligent scout conducts personalized interviews to assess your potential, 
                creating detailed reports for our professional evaluation team.
              </Text>
            </VStack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <VStack spacing={8}>
              <HStack spacing={8} justify="center" flexWrap="wrap">
                <VStack spacing={2} align="center">
                  <Box
                    w={16}
                    h={16}
                    bg="blue.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                  >
                    🤖
                  </Box>
                  <Text fontWeight="semibold" color="gray.700">
                    AI Interview
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Intelligent conversation<br />about your football journey
                  </Text>
                </VStack>

                <VStack spacing={2} align="center">
                  <Box
                    w={16}
                    h={16}
                    bg="green.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                  >
                    📝
                  </Box>
                  <Text fontWeight="semibold" color="gray.700">
                    Detailed Report
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    AI-generated assessment<br />and recommendation
                  </Text>
                </VStack>

                <VStack spacing={2} align="center">
                  <Box
                    w={16}
                    h={16}
                    bg="purple.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                  >
                    ⚽
                  </Box>
                  <Text fontWeight="semibold" color="gray.700">
                    Professional Review
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Expert evaluation by<br />our scouting team
                  </Text>
                </VStack>
              </HStack>

              <VStack spacing={4}>
                <Badge
                  colorScheme="orange"
                  fontSize="lg"
                  px={6}
                  py={3}
                  borderRadius="full"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  fontWeight="bold"
                >
                  Coming Soon
                </Badge>
                
                <Text fontSize="sm" color="gray.500">
                  AI Scout interviews launching soon • Stay tuned for updates
                </Text>
              </VStack>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
} 