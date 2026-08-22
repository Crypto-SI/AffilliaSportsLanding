'use client';

import { Box, Heading, Text, Container, Flex, Button, Image as ChakraImage, SimpleGrid } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { PlayerRegistrationForm } from '@/components/ui/PlayerRegistrationForm';

export default function PlayerPortalSection() {
  const MotionBox = motion.create(Box);
  const MotionButton = motion.create(Button);
  
  return (
    <Box as="section" id="player-portal" py={20} bg="white">
      <Container maxW="1240px">
        <AnimatedSection>
          <Box mb={14}>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="400"
              mb={6}
              color="neutral.900"
            >
              Player Performance Portal
            </Heading>
            <AnimatedText delay={0.2}>
              <Text fontSize="lg" maxW="800px" color="neutral.500" mb={4}>
                Track your development journey with our comprehensive player portal. Register for trials, receive professional scout evaluations, and monitor your performance metrics all in one place.
              </Text>
            </AnimatedText>
            <AnimatedText delay={0.3}>
              <Text fontSize="md" fontWeight="600" color="brand.500" mb={10}>
                Coming Soon
              </Text>
            </AnimatedText>
          </Box>
        </AnimatedSection>
        
        <Flex 
          direction={{ base: "column", lg: "row" }}
          gap={12}
          align="stretch"
        >
          {/* Portal description */}
          <MotionBox 
            flex="1" 
            borderRadius="xl" 
            bg="white"
            p={8}
            boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
            borderWidth="1px"
            borderColor="neutral.200"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.250, 0.460, 0.450, 0.940]
            }}
          >
            <SimpleGrid columns={{ base: 1, md: 1 }} spacing={8}>
              <Box>
                <Heading 
                  as="h3" 
                  fontSize="2xl" 
                  mb={4} 
                  fontWeight="400"
                  color="neutral.900"
                >
                  Key Features
                </Heading>
                
                <MotionBox 
                  mb={6}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Text fontSize="lg" fontWeight="500" color="brand.500" mb={2}>
                    Performance Tracking
                  </Text>
                  <Text fontSize="md" color="neutral.500">
                    Comprehensive statistics from trials and showcase matches to help you understand your strengths and areas for improvement.
                  </Text>
                </MotionBox>
                
                <MotionBox 
                  mb={6}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Text fontSize="lg" fontWeight="500" color="brand.500" mb={2}>
                    Scout Evaluations
                  </Text>
                  <Text fontSize="md" color="neutral.500">
                    Receive detailed reports from qualified scouts with personalized feedback on your performance.
                  </Text>
                </MotionBox>
                
                <MotionBox 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Text fontSize="lg" fontWeight="500" color="brand.500" mb={2}>
                    Development Opportunities
                  </Text>
                  <Text fontSize="md" color="neutral.500">
                    Exclusive access to upcoming trials and showcase matches to accelerate your football career.
                  </Text>
                </MotionBox>
                
                <Box mt={10}>
                  <PlayerRegistrationForm />
                </Box>
              </Box>
            </SimpleGrid>
          </MotionBox>
          
          {/* Portal image */}
          <MotionBox 
            flex="1"
            position="relative"
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={4}
            bg="white"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.250, 0.460, 0.450, 0.940]
            }}
          >
            <Box 
              position="relative" 
              width="100%" 
              height={{ base: "300px", md: "400px", lg: "100%" }}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image 
                src="/images/portal.webp"
                alt="Player portal dashboard showing performance metrics and scout reports"
                style={{ 
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%',
                  maxHeight: '450px'
                }}
                width={600}
                height={400}
                priority
              />

              {/* Feature indicators - pulsing dots */}
              <MotionBox
                position="absolute"
                top="30%"
                left="20%"
                width="16px"
                height="16px"
                borderRadius="full"
                bg="brand.500"
                animate={{ 
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(13, 123, 67, 0.7)',
                    '0 0 0 10px rgba(13, 123, 67, 0)',
                    '0 0 0 0 rgba(13, 123, 67, 0)'
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
              
              <MotionBox
                position="absolute"
                top="60%"
                right="25%"
                width="16px"
                height="16px"
                borderRadius="full"
                bg="brand.500"
                animate={{ 
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(13, 123, 67, 0.7)',
                    '0 0 0 10px rgba(13, 123, 67, 0)',
                    '0 0 0 0 rgba(13, 123, 67, 0)'
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 0.7
                }}
              />
              
              <MotionBox
                position="absolute"
                bottom="25%"
                left="35%"
                width="16px"
                height="16px"
                borderRadius="full"
                bg="brand.500"
                animate={{ 
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(13, 123, 67, 0.7)',
                    '0 0 0 10px rgba(13, 123, 67, 0)',
                    '0 0 0 0 rgba(13, 123, 67, 0)'
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 1.4
                }}
              />
            </Box>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
} 