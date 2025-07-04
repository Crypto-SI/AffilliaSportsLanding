'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Badge,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { motion } from 'motion/react';
import { FiUpload, FiUser, FiMail, FiPhone, FiFileText, FiCheck, FiStar } from 'react-icons/fi';
import PlayerApplicationForm from '@/components/ui/PlayerApplicationForm';

const MotionBox = motion.create(Box);
const MotionContainer = motion.create(Container);

export default function PlayerApplicationSection() {
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  const features = [
    {
      icon: FiUser,
      title: 'Professional Profile',
      description: 'Complete your player profile with position, experience level, and career goals'
    },
    {
      icon: FiFileText,
      title: 'CV Upload',
      description: 'Upload your CV in PDF, DOC, DOCX, or TXT format (max 10MB)'
    },
    {
      icon: FiMail,
      title: 'Direct Contact',
      description: 'Our scouts will contact you directly to discuss opportunities'
    },
    {
      icon: FiStar,
      title: 'Priority Review',
      description: 'All applications reviewed within 48 hours by our professional team'
    }
  ];

  const benefits = [
    'Professional representation and contract negotiation',
    'Career development and pathway planning',
    'Media training and public relations support',
    'Financial planning and investment guidance',
    'Legal protection and compliance assistance',
    'Network access to clubs and coaches worldwide'
  ];

  return (
    <>
      <Box bg={bgColor} py={20} id="player-applications">
        <MotionContainer 
          maxW="7xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={12} align="center">
            {/* Header Section */}
            <VStack spacing={6} textAlign="center" maxW="4xl">
              <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm">
                Player Applications
              </Badge>
              <Heading 
                size="2xl" 
                color={primaryColor}
                lineHeight="shorter"
                fontFamily="heading"
              >
                Ready to Take the Next Step?
              </Heading>
              <Text 
                fontSize="xl" 
                color={textColor}
                lineHeight="tall"
                maxW="3xl"
              >
                Join the next generation of professional athletes. Upload your CV and let our experienced team 
                of agents and scouts help you navigate your career to the highest level.
              </Text>
            </VStack>

            {/* Features Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Box
                    bg={cardBg}
                    p={6}
                    borderRadius="xl"
                    boxShadow="lg"
                    textAlign="center"
                    h="full"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'xl',
                    }}
                    transition="all 0.3s ease"
                  >
                    <Icon as={feature.icon} boxSize={8} color={primaryColor} mb={4} />
                    <Heading size="md" mb={3} color={primaryColor}>
                      {feature.title}
                    </Heading>
                    <Text color={textColor} fontSize="sm">
                      {feature.description}
                    </Text>
                  </Box>
                </MotionBox>
              ))}
            </SimpleGrid>

            {/* Benefits Section */}
            <MotionBox
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              w="full"
            >
              <Box bg={cardBg} p={8} borderRadius="xl" boxShadow="lg">
                <VStack spacing={6}>
                  <Heading size="lg" color={primaryColor} textAlign="center">
                    What You Get as Our Client
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <UnorderedList spacing={2}>
                      {benefits.slice(0, 3).map((benefit, index) => (
                        <ListItem key={index} color={textColor}>
                          <HStack>
                            <Icon as={FiCheck} color="green.500" />
                            <Text>{benefit}</Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </UnorderedList>
                    <UnorderedList spacing={2}>
                      {benefits.slice(3).map((benefit, index) => (
                        <ListItem key={index + 3} color={textColor}>
                          <HStack>
                            <Icon as={FiCheck} color="green.500" />
                            <Text>{benefit}</Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </UnorderedList>
                  </SimpleGrid>
                </VStack>
              </Box>
            </MotionBox>

            {/* Call to Action */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <VStack spacing={6} textAlign="center">
                <Text fontSize="lg" color={textColor} maxW="2xl">
                  Ready to start your professional journey? Submit your application today and let us help you reach the next level.
                </Text>
                <Button
                  size="lg"
                  colorScheme="blue"
                  leftIcon={<FiUpload />}
                  onClick={() => setIsApplicationFormOpen(true)}
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  transition="all 0.3s ease"
                >
                  Apply Now
                </Button>
                <Text fontSize="sm" color={textColor} fontStyle="italic">
                  All applications are reviewed within 48 hours
                </Text>
              </VStack>
            </MotionBox>
          </VStack>
        </MotionContainer>
      </Box>

      {/* Player Application Form Modal */}
      <PlayerApplicationForm
        isOpen={isApplicationFormOpen}
        onClose={() => setIsApplicationFormOpen(false)}
      />
    </>
  );
} 