'use client';

import { Box, Flex, Text, Button, HStack, Image, Container, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (item: { name: string; id: string; href?: string }) => {
    if (item.href) {
      // Navigate to external page
      window.location.href = item.href;
    } else {
      // Scroll to section on current page
      scrollToSection(item.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box 
        as="nav" 
        py={4} 
        borderBottom={scrolled ? "1px solid" : "none"}
        borderColor={scrolled ? "neutral.200" : "transparent"}
        position="fixed"
        top={0}
        width="100%"
        bg={scrolled ? "rgba(255, 255, 255, 0.5)" : "transparent"} 
        backdropFilter={scrolled ? "blur(10px)" : "none"}
        transition="all 0.3s ease"
        zIndex={1000}
        boxShadow={scrolled ? "0 2px 10px rgba(0, 0, 0, 0.05)" : "none"}
      >
        <Container maxW="1240px">
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Box 
                  mr={10}
                  cursor="pointer"
                  onClick={() => window.location.href = window.location.pathname}
                  position="relative"
                  width={{ base: "160px", md: "240px" }}
                  height={{ base: "40px", md: "55px" }}
                  overflow="visible"
                >
                  <img 
                    src={scrolled ? "/images/logos/affillia-logo-light.svg" : "/images/logos/affillia-logo-white.svg"}
                    alt="Affillia Sports" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              </motion.div>
              
              <HStack spacing={20} fontFamily="heading" display={{ base: 'none', md: 'flex' }}>
                {[
                  { name: 'About Us', id: 'about' },
                  { name: 'Player Portal', id: 'player-portal' },
                  { name: 'Services', id: 'services' },
                  { name: 'Player Applications', id: 'player-applications' },
                  { name: 'Financial Advisors', id: 'financial-advice' }
                ].map((link, index) => (
                  <motion.div 
                    key={link.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.3 + (index * 0.1),
                      ease: [0.25, 0.1, 0.25, 1.0]
                    }}
                    whileHover={{ y: -3 }}
                  >
                    <Text 
                      fontSize="lg" 
                      fontWeight="400" 
                      color={scrolled ? "neutral.900" : "white"}
                      cursor="pointer"
                      onClick={() => handleNavClick(link)}
                      _hover={{ color: scrolled ? "neutral.800" : "whiteAlpha.800", textDecoration: "underline" }}
                      transition="color 0.2s ease"
                    >
                      {link.name}
                    </Text>
                  </motion.div>
                ))}
              </HStack>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </motion.div>
  );
} 