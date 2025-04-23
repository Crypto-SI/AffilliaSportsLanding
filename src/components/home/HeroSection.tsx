'use client';

import { Box, Heading, Text, Button, Flex, Container, Stack, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { AnimatedText } from '../ui/AnimatedText';
import { AnimatedImage } from '../ui/AnimatedImage';

export default function HeroSection() {
  return (
    <Box
      as="section"
      pt={{ base: "80px", md: "100px" }}
      pb={32}
      position="relative"
      overflow="hidden"
      height={{ base: "calc(100vh - 0px)", md: "calc(100vh - 0px)" }}
      minHeight="600px"
    >
      {/* Main Hero Background Image */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={0}
        height="100%"
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          <Image
            src="/images/optimized/hero/large/hero-main-banner.webp"
            alt="Professional football stadium during a match"
            fill
            style={{ objectFit: 'cover' }}
            quality={90}
            priority
            sizes="100vw"
          />
        </motion.div>
      </Box>
      
      {/* Gradient overlay for better text readability */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-r, rgba(18, 30, 115, 0.85), rgba(18, 30, 115, 0.4))"
        zIndex={1}
      />
      
      {/* Decorative circle blur element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "100%",
          background: "var(--chakra-colors-brand-600)",
          filter: "blur(164px)",
          zIndex: 1
        }}
      />

      {/* Player silhouette overlay */}
      <Box
        position="absolute"
        right={{ base: "-50px", md: "0", lg: "100px" }}
        bottom={{ base: "50px", md: "80px", lg: "100px" }}
        height={{ base: "300px", md: "500px", lg: "600px" }}
        width={{ base: "250px", md: "400px", lg: "500px" }}
        zIndex={2}
        display={{ base: 'none', md: 'block' }}
        border="none"
        outline="none"
        boxShadow="none"
      >
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          <Image
            src="/images/optimized/hero/large/baller.webp"
            alt="Professional football player"
            fill
            style={{ 
              objectFit: 'contain',
              border: 'none', 
              outline: 'none'
            }}
            quality={90}
            priority
            sizes="(max-width: 768px) 250px, (max-width: 1200px) 400px, 500px"
          />
        </motion.div>
      </Box>

      <Container maxW="1240px" position="relative" zIndex={3} h="100%" display="flex" alignItems="center">
        <VStack 
          spacing={8} 
          align="flex-start" 
          maxW="647px" 
          mt={{ base: "120px", md: "140px" }}
          pt={{ base: "40px", md: "0" }}
        >
          <AnimatedText
            as="h1"
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            lineHeight="1.1"
            letterSpacing="0.01em"
            fontWeight="400"
            fontFamily="var(--font-alice), serif !important"
            color="white"
            textTransform="uppercase"
            delay={0.3}
          >
            Elite Representation for Elite Performers
          </AnimatedText>
          
          <AnimatedText 
            fontSize="lg" 
            color="white" 
            lineHeight="1.5"
            delay={1.2}
          >
            Where exclusivity meets excellence. Personalized service for select athletes, 
            empowering their journey on and off the pitch.
          </AnimatedText>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 1.4,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          >
            <Flex gap={5} mt={4}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  bg="neutral.900"
                  color="white"
                  size="lg"
                  px={10}
                  py={6}
                  height="auto"
                  fontWeight="400"
                  borderRadius="md"
                  _hover={{ bg: 'neutral.800' }}
                >
                  Discover Affillia
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  color="white"
                  size="lg"
                  px={10}
                  py={6}
                  height="auto"
                  fontWeight="400"
                  borderRadius="md"
                  borderColor="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  See Our Legacy
                </Button>
              </motion.div>
            </Flex>
          </motion.div>
        </VStack>
      </Container>
    </Box>
  );
} 