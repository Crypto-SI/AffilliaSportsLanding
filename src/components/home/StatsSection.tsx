'use client';

import { Box, Heading, Text, Flex, Container, SimpleGrid, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

type StatItemProps = {
  value: string;
  label: string;
  index?: number;
};

const StatItem = ({ value, label, index = 0 }: StatItemProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);
  const [unit, setUnit] = useState('');
  const [suffix, setSuffix] = useState('');
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Extract number, unit prefix, and suffix from value string
  useEffect(() => {
    if (!hasAnimated && isInView) {
      let numValue = 0;
      let unitPrefix = '';
      let valueSuffix = '';
      
      // Extract unit and number from the value string
      // e.g. "£1.3b" → unit="£", number=1.3, suffix="b"
      // e.g. "300+" → unit="", number=300, suffix="+"
      const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)([^\d]*)$/);
      
      if (match) {
        unitPrefix = match[1] || '';
        numValue = parseFloat(match[2]);
        valueSuffix = match[3] || '';
      }
      
      setUnit(unitPrefix);
      setSuffix(valueSuffix);
      
      // Animate count
      let start = 0;
      const end = numValue;
      const duration = 2000;
      const increment = end / 60; // 60 frames for 1 second at 60fps
      
      const timer = setInterval(() => {
        start += increment;
        
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
          setHasAnimated(true);
        } else {
          setCount(start);
        }
      }, duration / 60);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value, hasAnimated]);
  
  const MotionBox = motion.create(Box);
  
  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: 0.2 + (index * 0.1),
        ease: [0.250, 0.460, 0.450, 0.940]
      }}
    >
      <VStack spacing={2} px={4}>
        <Heading
          fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
          fontWeight="400"
          color="white"
          fontFamily="heading"
        >
          {hasAnimated ? value : `${unit}${count.toFixed(value.includes('.') ? 1 : 0)}${suffix}`}
        </Heading>
        <Text
          fontSize={{ base: "sm", md: "md", lg: "lg" }}
          color="white"
          textAlign="center"
          fontFamily="body"
          fontWeight="300"
        >
          {label}
        </Text>
      </VStack>
    </MotionBox>
  );
};

export default function StatsSection() {
  const MotionBox = motion.create(Box);
  
  return (
    <Box 
      as="section"
      id="stats"
      py={16} 
      position="relative"
      overflow="hidden"
    >
      {/* Background image */}
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
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <Image
            src="/images/optimized/stats/large/stats-background.webp"
            alt="Football stadium background"
            fill
            style={{ objectFit: 'cover' }}
            quality={80}
            sizes="100vw"
          />
        </MotionBox>
      </Box>
      
      {/* Dark overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(15, 15, 25, 0.85)"
        zIndex={1}
      />

      <Container maxW="1240px" position="relative" zIndex={2}>
        <AnimatedSection>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="400"
            mb={12}
            color="white"
            textAlign="center"
            fontFamily="heading"
          >
            Our Legacy of Excellence
          </Heading>
        </AnimatedSection>
        <Flex 
          justify="space-between" 
          align="center" 
          flexWrap="wrap"
          gap={{ base: 10, md: 0 }}
        >
          <StatItem value="£1.3b" label="Total Fees Negotiated" index={0} />
          <StatItem value="300+" label="Players Transferred" index={1} />
          <StatItem value="95" label="Trophies Won" index={2} />
          <StatItem value="200+" label="Leagues Represented" index={3} />
        </Flex>
      </Container>
    </Box>
  );
} 