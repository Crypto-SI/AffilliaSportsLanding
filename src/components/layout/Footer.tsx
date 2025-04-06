'use client';

import { Box, Container, Flex, Text, Heading, SimpleGrid, VStack, HStack, Divider, Link, Icon } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export default function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.1 });
  const MotionBox = motion.create(Box);
  const MotionVStack = motion.create(VStack);
  const MotionFlex = motion.create(Flex);
  const MotionHStack = motion.create(HStack);
  
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.250, 0.460, 0.450, 0.940]
      }
    }
  };
  
  const socialIconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.15,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      transition: { 
        duration: 0.2
      }
    }
  };
  
  return (
    <Box as="footer" color="white" py={12} position="relative" overflow="hidden" ref={footerRef}>
      {/* Footer background texture */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={0}
      >
        <MotionBox
          position="relative"
          width="100%"
          height="100%"
          initial={{ scale: 1.1 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <Image
            src="/images/optimized/footer/large/footer-texture.webp"
            alt="Footer background texture"
            fill
            style={{ objectFit: 'cover' }}
            quality={80}
            sizes="100vw"
          />
        </MotionBox>
        
        {/* Dark overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(20, 20, 30, 0.9)"
        />
      </Box>
      
      <Container maxW="1240px" position="relative" zIndex={1}>
        <MotionFlex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          mb={10}
          gap={10}
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Logo and About */}
          <MotionVStack align="flex-start" maxW="350px" spacing={4} variants={itemVariants}>
            <VStack align="flex-start" spacing={1}>
              <MotionBox 
                position="relative"
                width={{ base: "180px", md: "240px" }}
                height={{ base: "45px", md: "60px" }}
                overflow="visible"
                initial={{ opacity: 0, y: -10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <img 
                  src="/images/logos/affillia-logo-dark.svg" 
                  alt="Affillia Sports" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </MotionBox>
              <Text 
                fontSize="md" 
                fontFamily="heading" 
                color="white" 
                letterSpacing="1px"
                mt={2}
              >
                EMPOWERING EXCELLENCE
              </Text>
            </VStack>
            <Text color="whiteAlpha.800" fontSize="sm" lineHeight="1.6">
              Where exclusivity meets excellence. Personalized service for select athletes, 
              empowering their journey on and off the pitch.
            </Text>
          </MotionVStack>
          
          {/* Links Section */}
          <Flex 
            justify="space-between" 
            flexGrow={1} 
            maxW={{ base: 'full', md: '60%' }}
            gap={10}
            wrap="wrap"
          >
            {/* Quick Links Column */}
            <MotionVStack align="flex-start" spacing={4} minW="120px" variants={itemVariants}>
              <Heading size="sm" textTransform="uppercase" mb={2}>Quick Links</Heading>
              <VStack align="flex-start" spacing={3}>
                <motion.div whileHover={{ x: 3, color: "brand.500" }} transition={{ duration: 0.2 }}>
                  <Link href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link>
                </motion.div>
                <motion.div whileHover={{ x: 3, color: "brand.500" }} transition={{ duration: 0.2 }}>
                  <Link href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About Us</Link>
                </motion.div>
                <motion.div whileHover={{ x: 3, color: "brand.500" }} transition={{ duration: 0.2 }}>
                  <Link href="#achievements" onClick={(e) => { e.preventDefault(); document.getElementById('achievements')?.scrollIntoView({ behavior: 'smooth' }); }}>Achievements</Link>
                </motion.div>
                <motion.div whileHover={{ x: 3, color: "brand.500" }} transition={{ duration: 0.2 }}>
                  <Link href="#services" onClick={(e) => { e.preventDefault(); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}>Services</Link>
                </motion.div>
              </VStack>
            </MotionVStack>
            
            {/* Contact Information */}
            <MotionVStack id="contact" align="flex-start" spacing={4} minW="200px" variants={itemVariants}>
              <Heading size="sm" textTransform="uppercase" mb={2}>Contact</Heading>
              <Text fontSize="sm" color="whiteAlpha.800">
                Affillia Sports
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                +44 (0) 20 XXXX XXXX
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                contact@affiliasports.com
              </Text>
            </MotionVStack>
            
            {/* Social Media */}
            <MotionVStack align="flex-start" spacing={4} minW="150px" variants={itemVariants}>
              <Heading size="sm" textTransform="uppercase" mb={2}>Follow Us</Heading>
              <MotionHStack spacing={4} variants={staggerContainerVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                <motion.div variants={socialIconVariants} whileHover="hover">
                  <Box p={2} bg="whiteAlpha.100" borderRadius="md">
                    <Icon as={FaInstagram} color="white" boxSize={5} />
                  </Box>
                </motion.div>
                <motion.div variants={socialIconVariants} whileHover="hover">
                  <Box p={2} bg="whiteAlpha.100" borderRadius="md">
                    <Icon as={FaTwitter} color="white" boxSize={5} />
                  </Box>
                </motion.div>
                <motion.div variants={socialIconVariants} whileHover="hover">
                  <Box p={2} bg="whiteAlpha.100" borderRadius="md">
                    <Icon as={FaLinkedin} color="white" boxSize={5} />
                  </Box>
                </motion.div>
                <motion.div variants={socialIconVariants} whileHover="hover">
                  <Box p={2} bg="whiteAlpha.100" borderRadius="md">
                    <Icon as={FaFacebook} color="white" boxSize={5} />
                  </Box>
                </motion.div>
              </MotionHStack>
            </MotionVStack>
          </Flex>
        </MotionFlex>
        
        <Divider borderColor="whiteAlpha.300" />
        
        <MotionHStack 
          pt={6} 
          justify="space-between" 
          fontSize="sm" 
          color="whiteAlpha.700"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Text>
            Copyright © {new Date().getFullYear()} Affillia Sports. All rights reserved.
          </Text>
          <HStack spacing={4}>
            <motion.div whileHover={{ x: 3, color: "brand.500" }} transition={{ duration: 0.2 }}>
              <Link href="/privacy">Privacy Policy</Link>
            </motion.div>
          </HStack>
        </MotionHStack>
      </Container>
    </Box>
  );
} 