'use client';

import { Box, Heading, Text, Container, SimpleGrid, Flex, Avatar, Link, Icon, HStack } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import { motion } from 'motion/react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { AnimatedText } from '../ui/AnimatedText';
import { AnimatedImage } from '../ui/AnimatedImage';

export default function AboutSection() {
  return (
    <Box as="section" id="about" py={20} bg="white">
      <Container maxW="1240px">
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
              About Affillia Sports
            </AnimatedText>
            <AnimatedText 
              fontSize="lg" 
              maxW="800px" 
              mx="auto" 
              color="neutral.500"
              delay={0.2}
            >
              Where exclusivity meets excellence. Personalized service for select athletes, 
              empowering their journey on and off the pitch.
            </AnimatedText>
          </Box>
        </AnimatedSection>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          {/* Our Mission */}
          <AnimatedSection delay={0.3} direction="right">
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
              borderWidth="1px"
              borderColor="neutral.200"
              position="relative"
              display="flex"
            >
              <Box w="50%" position="relative" bg="neutral.100">
                {/* Success Story image */}
                <Box position="relative" h="full">
                  <AnimatedImage
                    src="/images/optimized/about/large/about-success-story.webp"
                    alt="Player success story showing career progression"
                    imageFill
                    containerHeight="100%"
                    effect="zoom"
                    imageStyle={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <Box 
                    h="full" 
                    bg="neutral.900" 
                    w="10px" 
                    position="absolute" 
                    right="0" 
                    borderRightRadius="3xl"
                    zIndex={1}
                  />
                </Box>
              </Box>
              
              <Box w="50%" p={8}>
                <AnimatedText
                  as="h3" 
                  fontSize="2xl" 
                  mb={4} 
                  fontWeight="400"
                  color="neutral.900"
                  delay={0.4}
                >
                  Our Mission
                </AnimatedText>
                
                <AnimatedText 
                  fontSize="md" 
                  color="neutral.900" 
                  mb={6}
                  delay={0.5}
                >
                  Affillia Sports redefines athlete representation by delivering tailored, boutique service. 
                  We prioritize our clients' success and well-being, building legacies that go beyond the game.
                </AnimatedText>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ x: 5 }}
                >
                  <HStack color="brand.500" fontWeight="medium">
                    <Text>Learn More</Text>
                    <motion.div whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400 }}>
                      <ArrowForwardIcon />
                    </motion.div>
                  </HStack>
                </motion.div>
              </Box>
            </Box>
          </AnimatedSection>
          
          {/* Why Choose Us */}
          <AnimatedSection delay={0.4} direction="left">
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
              borderWidth="1px"
              borderColor="neutral.200"
              position="relative"
              display="flex"
            >
              <Box w="50%" p={8}>
                <AnimatedText
                  as="h3" 
                  fontSize="2xl" 
                  mb={4} 
                  fontWeight="400"
                  color="neutral.900"
                  delay={0.5}
                >
                  Why Choose Us
                </AnimatedText>
                
                <AnimatedText 
                  fontSize="md" 
                  color="neutral.500" 
                  mb={6}
                  delay={0.6}
                >
                  Affillia Sports is not about quantity—it's about quality. Our capped roster guarantees 
                  personalized attention, while our strategic approach and media connections set us apart in the industry.
                </AnimatedText>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  whileHover={{ x: 5 }}
                >
                  <HStack color="brand.500" fontWeight="medium">
                    <Text>Learn More</Text>
                    <motion.div whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400 }}>
                      <ArrowForwardIcon />
                    </motion.div>
                  </HStack>
                </motion.div>
              </Box>
              
              <Box w="50%" position="relative" bg="neutral.100">
                {/* Team Meeting image */}
                <Box position="relative" h="full">
                  <AnimatedImage
                    src="/images/optimized/about/large/about-team-meeting.webp"
                    alt="Team meeting between agents and players"
                    imageFill
                    containerHeight="100%"
                    effect="zoom"
                    imageStyle={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </Box>
              </Box>
            </Box>
          </AnimatedSection>
        </SimpleGrid>
        
        {/* Founders' Stories */}
        <AnimatedSection delay={0.6} distance={40}>
          <Box
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
            borderWidth="1px"
            borderColor="neutral.200"
            p={10}
          >
            <AnimatedText
              as="h3" 
              fontSize="3xl" 
              mb={8} 
              fontWeight="400"
              color="neutral.900"
              textAlign="center"
            >
              Founders' Stories
            </AnimatedText>
            
            <Flex direction="column" gap={12}>
              {/* Tom White changed to James Flood */}
              <AnimatedSection delay={0.7} direction="right">
                <Flex 
                  direction={{ base: "column", md: "row" }} 
                  gap={{ base: 6, md: 12 }}
                  align="center"
                >
                  <Box 
                    position="relative" 
                    width={{ base: "200px", md: "250px" }} 
                    height={{ base: "200px", md: "250px" }} 
                    borderRadius="xl" 
                    overflow="hidden"
                    flexShrink={0}
                  >
                    <Image
                      src="/images/optimized/about/large/about-founder-portrait.webp"
                      alt="James Flood, Founder"
                      fill
                      style={{ 
                        objectFit: 'cover',
                      }}
                      sizes="(max-width: 768px) 200px, 250px"
                      priority
                    />
                  </Box>
                  
                  <Box flex="1">
                    <AnimatedText
                      as="h4" 
                      fontSize="2xl" 
                      mb={4} 
                      fontWeight="400"
                      color="neutral.900"
                      delay={0.8}
                    >
                      James Flood
                    </AnimatedText>
                    <AnimatedText 
                      as="h5" 
                      fontSize="lg" 
                      fontWeight="500" 
                      color="brand.500" 
                      mb={2}
                      delay={0.9}
                    >
                      Co-Founder & Media Director
                    </AnimatedText>
                    <AnimatedText 
                      fontSize="md" 
                      color="neutral.500"
                      delay={1.0}
                    >
                      A distinguished figure in sports journalism for over 18 years, James brings exceptional media 
                      connections and strategic insight to Affillia Sports. His background in player psychology and 
                      communications has revolutionized how we approach athlete development and public relations.
                    </AnimatedText>
                  </Box>
                </Flex>
              </AnimatedSection>
              
              {/* Carl Anthony */}
              <AnimatedSection delay={0.9} direction="left">
                <Flex 
                  direction={{ base: "column", md: "row-reverse" }} 
                  gap={{ base: 6, md: 12 }}
                  align="center"
                >
                  <Box 
                    position="relative" 
                    width={{ base: "200px", md: "250px" }} 
                    height={{ base: "200px", md: "250px" }} 
                    borderRadius="xl" 
                    overflow="hidden"
                    flexShrink={0}
                  >
                    <Image
                      src="/images/carl.png"
                      alt="Carl Anthony, Founder"
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 200px, 250px"
                      priority
                    />
                  </Box>
                  
                  <Box flex="1">
                    <AnimatedText
                      as="h4" 
                      fontSize="2xl" 
                      mb={4} 
                      fontWeight="400"
                      color="neutral.900"
                      delay={1.0}
                    >
                      Carl Anthony
                    </AnimatedText>
                    <AnimatedText 
                      as="h5" 
                      fontSize="lg" 
                      fontWeight="500" 
                      color="brand.500" 
                      mb={2}
                      delay={1.1}
                    >
                      Co-Founder & Player Relations Director
                    </AnimatedText>
                    <AnimatedText 
                      fontSize="md" 
                      color="neutral.500"
                      delay={1.2}
                    >
                      Carl is a tech entrepreneur with a passion for football who is always looking for a new challenge. His business acumen, patience, and vision are a great asset to Affillia Sports, helping drive the agency forward in innovative ways.
                    </AnimatedText>
                  </Box>
                </Flex>
              </AnimatedSection>
            </Flex>
          </Box>
        </AnimatedSection>
      </Container>
    </Box>
  );
} 