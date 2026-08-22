'use client';

import { Box, Flex, Text, HStack, Container, IconButton, VStack, useDisclosure, Collapse } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const NAV_LINKS = [
  { name: 'About Us', id: 'about' },
  { name: 'Player Portal', id: 'player-portal' },
  { name: 'Services', id: 'services' },
  { name: 'Player Applications', id: 'player-applications' },
  { name: 'Financial Advisors', id: 'financial-advice' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isOpen, onToggle, onClose } = useDisclosure();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (link: { id: string; href?: string }) => {
    onClose();
    if (link.href) {
      window.location.href = link.href;
    } else {
      scrollToSection(link.id);
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
        borderBottom={scrolled || isOpen ? "1px solid" : "none"}
        borderColor={scrolled || isOpen ? "neutral.200" : "transparent"}
        position="fixed"
        top={0}
        width="100%"
        bg={scrolled || isOpen ? "rgba(255, 255, 255, 0.92)" : "transparent"} 
        backdropFilter={scrolled || isOpen ? "blur(10px)" : "none"}
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
                  mr={{ base: 0, md: 10 }}
                  cursor="pointer"
                  onClick={() => {
                    onClose();
                    window.location.href = window.location.pathname;
                  }}
                  position="relative"
                  width={{ base: "160px", md: "240px" }}
                  height={{ base: "40px", md: "55px" }}
                  overflow="visible"
                >
                  <img 
                    src={scrolled || isOpen ? "/images/logos/affillia-logo-light.svg" : "/images/logos/affillia-logo-white.svg"}
                    alt="Affillia Sports" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              </motion.div>
            </Flex>

            {/* Desktop links */}
            <HStack spacing={20} fontFamily="heading" display={{ base: 'none', md: 'flex' }}>
              {NAV_LINKS.map((link, index) => (
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

            {/* Mobile hamburger */}
            <IconButton
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              icon={isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
              onClick={onToggle}
              display={{ base: 'flex', md: 'none' }}
              variant="ghost"
              color={scrolled || isOpen ? "neutral.900" : "white"}
              fontSize="26px"
              size="lg"
              _hover={{ bg: scrolled || isOpen ? "blackAlpha.50" : "whiteAlpha.200" }}
            />
          </Flex>
        </Container>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <Container maxW="1240px" pb={4}>
                <VStack spacing={1} align="stretch" fontFamily="heading">
                  {NAV_LINKS.map((link) => (
                    <Text
                      key={link.id}
                      fontSize="lg"
                      py={3}
                      px={4}
                      color="neutral.800"
                      cursor="pointer"
                      textAlign="center"
                      borderRadius="md"
                      _hover={{ bg: "blackAlpha.50" }}
                      onClick={() => handleNavClick(link)}
                    >
                      {link.name}
                    </Text>
                  ))}
                </VStack>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}
