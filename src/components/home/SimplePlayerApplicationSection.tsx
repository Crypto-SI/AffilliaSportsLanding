'use client';

import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'motion/react';
import { FiUpload } from 'react-icons/fi';

const MotionBox = motion.create(Box);
const MotionContainer = motion.create(Container);

export default function SimplePlayerApplicationSection() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgColor} py={20} id="player-applications">
      <MotionContainer 
        maxW="7xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <VStack spacing={12} align="center">
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
              Join the next generation of professional athletes. Contact us to discuss your application.
            </Text>
          </VStack>

          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={6} textAlign="center">
              <Text fontSize="lg" color={textColor} maxW="2xl">
                Ready to start your professional journey? Contact us today to discuss your application.
              </Text>
              <Button
                size="lg"
                colorScheme="blue"
                leftIcon={<FiUpload />}
                onClick={() => alert('Application form will be available soon!')}
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
                Contact Us
              </Button>
              <Text fontSize="sm" color={textColor} fontStyle="italic">
                All applications are reviewed within 48 hours
              </Text>
            </VStack>
          </MotionBox>
        </VStack>
      </MotionContainer>
    </Box>
  );
} 