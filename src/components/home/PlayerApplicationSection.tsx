'use client';

import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Button,
  Image,
  Flex
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { AnimatedText } from '../ui/AnimatedText';
import PlayerApplicationForm from '../ui/PlayerApplicationForm';



export default function PlayerApplicationSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render until client-side to avoid hydration mismatches
  if (!isClient) {
    return (
      <Box as="section" id="player-application" py={20} bg="neutral.50">
        <Container maxW="1240px">
          <VStack spacing={12} align="center">
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="neutral.900">
                Player Application
              </Heading>
              <Text fontSize="lg" color="neutral.500" maxW="2xl">
                Ready to take your football career to the next level? Apply to join our exclusive roster.
              </Text>
            </VStack>
            <Box>Loading...</Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="section" id="player-application" py={20} bg="neutral.50" position="relative" overflow="hidden">
      <Container maxW="1240px">
        <Flex align="center" justify="space-between" position="relative">
          {/* Left side image */}
          <Box 
            position="absolute" 
            left={{ base: "-50px", md: "-100px", lg: "-150px" }} 
            top="50%" 
            transform="translateY(-50%)"
            zIndex={1}
            display={{ base: "none", lg: "block" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300&h=400&fit=crop&crop=faces"
              alt="Football player in action"
              width="200px"
              height="300px"
              objectFit="cover"
              borderRadius="xl"
              boxShadow="lg"
              opacity={0.8}
            />
          </Box>

          {/* Right side image */}
          <Box 
            position="absolute" 
            right={{ base: "-50px", md: "-100px", lg: "-150px" }} 
            top="50%" 
            transform="translateY(-50%)"
            zIndex={1}
            display={{ base: "none", lg: "block" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=400&fit=crop&crop=faces"
              alt="Professional football player"
              width="200px"
              height="300px"
              objectFit="cover"
              borderRadius="xl"
              boxShadow="lg"
              opacity={0.8}
            />
          </Box>

          {/* Main content */}
          <Box flex={1} zIndex={2} position="relative">
            <AnimatedSection>
              <Box textAlign="center" mb={16}>
                <AnimatedText
                  as="h2"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="400"
                  fontFamily="var(--font-alice), serif !important"
                  mb={6}
                  color="neutral.900"
                >
                  Player Application
                </AnimatedText>
                <AnimatedText 
                  fontSize="lg" 
                  maxW="800px" 
                  mx="auto" 
                  color="neutral.500"
                  delay={0.2}
                >
                  Ready to take your football career to the next level? Apply to join our exclusive roster 
                  of elite performers and experience personalized representation that goes beyond the game.
                </AnimatedText>
              </Box>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Box textAlign="center">
                <Button
                  onClick={() => setIsFormOpen(true)}
                  bg="brand.500"
                  color="white"
                  size="xl"
                  px={12}
                  py={8}
                  height="auto"
                  fontWeight="400"
                  borderRadius="md"
                  fontSize="lg"
                  _hover={{ 
                    bg: 'brand.600', 
                    transform: "translateY(-2px)", 
                    boxShadow: "xl" 
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                >
                  Apply Here
                </Button>
                
                <VStack spacing={2} mt={6}>
                  <Text fontSize="sm" color="neutral.600">
                    <strong>Response Time:</strong> We typically respond within 48 hours
                  </Text>
                  <Text fontSize="sm" color="neutral.600">
                    <strong>Privacy:</strong> Your information is kept confidential and secure
                  </Text>
                  <Text fontSize="sm" color="neutral.600">
                    <strong>Next Steps:</strong> Successful applicants will be contacted for an initial consultation
                  </Text>
                </VStack>
              </Box>

              <PlayerApplicationForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
              />
            </AnimatedSection>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}