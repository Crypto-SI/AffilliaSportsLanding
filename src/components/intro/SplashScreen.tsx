'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    // Progress through animation stages
    const timer1 = setTimeout(() => setStage(1), 1000);
    const timer2 = setTimeout(() => setStage(2), 2000);
    const timer3 = setTimeout(() => {
      setStage(3);
      setTimeout(onComplete, 1000);
    }, 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);
  
  return (
    <AnimatePresence>
      {stage < 3 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {stage === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Text 
                fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }}
                fontFamily="var(--font-alice), serif"
                fontWeight="400"
                color="white"
              >
                Affillia
              </Text>
            </motion.div>
          )}
          
          {stage === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Text 
                fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }}
                fontFamily="var(--font-alice), serif"
                fontWeight="400"
                color="white"
                mb={4}
              >
                Affillia
              </Text>
              <Text 
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                fontFamily="var(--font-alice), serif"
                fontWeight="400"
                color="white"
                letterSpacing="0.2em"
                textTransform="uppercase"
              >
                sports
              </Text>
            </motion.div>
          )}
          
          {stage === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Text 
                fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }}
                fontFamily="var(--font-alice), serif"
                fontWeight="400"
                color="white"
                mb={4}
              >
                Affillia
              </Text>
              <Text 
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                fontFamily="var(--font-alice), serif"
                fontWeight="400"
                color="white"
                letterSpacing="0.2em"
                textTransform="uppercase"
                mb={8}
              >
                sports
              </Text>
              <Text 
                fontSize={{ base: "md", md: "lg" }}
                fontFamily="var(--font-inter), sans-serif"
                color="white"
                fontWeight="300"
                maxW="500px"
                px={4}
              >
                We create opportunity.
              </Text>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 