'use client';

import { Box, Heading, Text, Container, Flex, VStack } from '@chakra-ui/react';
import { motion } from 'motion/react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedText } from '@/components/ui/AnimatedText';

export default function PhilosophySection() {
  const MotionBox = motion.create(Box);
  const MotionText = motion.create(Text);
  
  return (
    <Box as="section" id="philosophy" py={20} bg="neutral.50">
      <Container maxW="1240px">
        <AnimatedSection>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="400"
            mb={16}
            color="neutral.900"
            textAlign="center"
          >
            Our Philosophy
          </Heading>
        </AnimatedSection>
        
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={12}
          align="stretch"
        >
          {/* Scrollable text box */}
          <MotionBox 
            flex="1" 
            borderRadius="xl" 
            bg="white"
            p={8}
            boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
            borderWidth="1px"
            borderColor="neutral.200"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.250, 0.460, 0.450, 0.940] }}
          >
            <Box 
              height="400px" 
              overflowY="auto"
              pr={4}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#718096',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#5a6986',
                },
              }}
            >
              <VStack spacing={6} align="start">
                <MotionText 
                  fontSize="lg" 
                  color="neutral.700" 
                  as="blockquote" 
                  fontStyle="italic"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  "The answer to the future is rather obvious. If the tapdancing becomes less constant, less furious, less necessary, what will the result be? The result will be more honesty, more focus, fewer clients, but eventually the revenues will be the same."
                </MotionText>
                
                <AnimatedText delay={0.2}>
                  <Text as="div" fontSize="md" color="neutral.600">
                    At Affillia Sports, we believe in quality over quantity. Our philosophy centers on maintaining a smaller, more focused roster of elite athletes whom we can serve with unprecedented dedication and personalized attention.
                  </Text>
                </AnimatedText>
                
                <AnimatedText delay={0.3}>
                  <Text as="div" fontSize="md" color="neutral.600">
                    We've learned that success in sports representation isn't measured by the number of clients, but by the depth of relationships and the quality of service provided to each individual athlete.
                  </Text>
                </AnimatedText>
                
                <MotionText 
                  fontSize="lg" 
                  color="neutral.700" 
                  as="blockquote" 
                  fontStyle="italic"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  "And now we get to the answer that Dicky Fox knew years ago. The answer is fewer clients. Less dancing. More truth. We must crack open the tightly clenched fist of commerce and give a little back for the greater good."
                </MotionText>
                
                <AnimatedText delay={0.5}>
                  <Text as="div" fontSize="md" color="neutral.600">
                    By focusing on a select group of athletes, we create space for genuine connection, allowing us to truly understand each client's unique needs, aspirations, and challenges. This intimate knowledge enables us to provide tailored guidance that goes beyond standard representation.
                  </Text>
                </AnimatedText>
                
                <MotionText 
                  fontSize="lg" 
                  color="neutral.700" 
                  as="blockquote" 
                  fontStyle="italic"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  "Learn who these people are. That is the stuff of your relationship. That is what will matter. People always respond best to personal attention, it is the simplest and easiest truth to forget."
                </MotionText>
                
                <AnimatedText delay={0.7}>
                  <Text as="div" fontSize="md" color="neutral.600">
                    Our exclusive approach allows us to be fully present for our clients - available when they need us, responsive to their concerns, and proactive in identifying opportunities. We don't just manage careers; we nurture them with the care and attention they deserve.
                  </Text>
                </AnimatedText>
                
                <AnimatedText delay={0.8}>
                  <Text as="div" fontSize="md" color="neutral.600">
                    This philosophy is our manifesto for a more meaningful approach to sports representation - one that values relationships over volume and quality over quantity.
                  </Text>
                </AnimatedText>
              </VStack>
            </Box>
          </MotionBox>
          
          {/* Visual section - replacing the download section */}
          <MotionBox 
            flex="1" 
            borderRadius="xl" 
            bg="brand.500"
            p={8}
            boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
            color="white"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.250, 0.460, 0.450, 0.940] }}
          >
            <Box position="relative" mb={8}>
              <MotionBox 
                position="absolute"
                top="-30px"
                right="-30px"
                width="150px"
                height="150px"
                borderRadius="full"
                bg="brand.600"
                filter="blur(40px)"
                opacity="0.6"
                zIndex={0}
                animate={{ 
                  scale: [1, 1.2, 1], 
                  opacity: [0.6, 0.8, 0.6] 
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              />
              <Heading
                as="h3"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="400"
                mb={6}
                position="relative"
                zIndex={1}
                textAlign="center"
              >
                Our Commitment
              </Heading>
              <AnimatedText delay={0.2}>
                <Text as="div" fontSize="md" mb={8} position="relative" zIndex={1} textAlign="center">
                  "The Things We Think and Do Not Say" is our guiding manifesto that explores our approach to sports representation and why we believe in focusing on fewer clients to deliver exceptional service.
                </Text>
              </AnimatedText>
              <AnimatedText delay={0.4} staggerChildren={true}>
                <Text as="div" fontSize="md" position="relative" zIndex={1} textAlign="center" fontStyle="italic" mb={6}>
                  "Quality is not an act, it is a habit. We choose quality representation over quantity, creating deeper relationships and better outcomes for our select roster of athletes."
                </Text>
              </AnimatedText>
              <MotionBox 
                bg="rgba(255, 255, 255, 0.15)" 
                py={3} 
                px={6} 
                borderRadius="md" 
                textAlign="center"
                position="relative"
                zIndex={1}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(255, 255, 255, 0.25)" 
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Text 
                  fontWeight="500"
                  fontSize="sm"
                  letterSpacing="1px"
                  textTransform="uppercase"
                >
                  Document Download Coming Soon
                </Text>
              </MotionBox>
            </Box>
          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
} 