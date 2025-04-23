'use client';

import { Box, Text, Container, Flex, Heading, VStack } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import React, { ReactNode } from 'react';

// Define our own simpler animation components to avoid linter errors
const MotionBox = motion(Box);

interface AnimatedBoxProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 30
}) => {
  // Calculate initial animation properties
  const getInitialProps = () => {
    switch (direction) {
      case 'down': return { opacity: 0, y: -distance };
      case 'left': return { opacity: 0, x: distance };
      case 'right': return { opacity: 0, x: -distance };
      case 'up':
      default: return { opacity: 0, y: distance };
    }
  };

  // Get animate to properties
  const getAnimateProps = () => {
    switch (direction) {
      case 'down':
      case 'up': return { opacity: 1, y: 0 };
      case 'left':
      case 'right': return { opacity: 1, x: 0 };
      default: return { opacity: 1 };
    }
  };

  return (
    <MotionBox
      initial={getInitialProps()}
      whileInView={getAnimateProps()}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
    >
      {children}
    </MotionBox>
  );
};

interface AdvisorCardProps {
  name: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  isReversed?: boolean;
  animationDelay?: number;
}

const AdvisorCard: React.FC<AdvisorCardProps> = ({
  name,
  title,
  description,
  imageSrc,
  imageAlt,
  isReversed = false,
  animationDelay = 0
}) => {
  return (
    <AnimatedBox 
      delay={animationDelay} 
      direction={isReversed ? "left" : "right"}
    >
      <Flex
        direction={{ base: "column", md: isReversed ? "row-reverse" : "row" }}
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
            src={imageSrc}
            alt={imageAlt}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 200px, 250px"
            priority
          />
        </Box>

        <VStack align={isReversed ? "flex-end" : "flex-start"} spacing={3} flex="1" textAlign={isReversed ? "right" : "left"}>
          <Heading
            as="h4"
            fontSize="2xl"
            fontWeight="400"
            color="neutral.900"
          >
            {name}
          </Heading>
          
          <Text
            fontSize="lg"
            fontWeight="500"
            color="brand.500"
          >
            {title}
          </Text>
          
          <Text
            fontSize="md"
            color="neutral.500"
          >
            {description}
          </Text>
        </VStack>
      </Flex>
    </AnimatedBox>
  );
};

export default function FinancialAdviceSection() {
  const advisors = [
    {
      name: "Sarah Mitchell",
      title: "Wealth Management Director",
      description: "With over 15 years specializing in athlete wealth management, Sarah has helped hundreds of players build sustainable financial foundations. Her expertise in tax optimization, investment strategies, and retirement planning provides our clients with comprehensive financial security both during and after their playing careers.",
      imageSrc: "/images/10.png",
      imageAlt: "Sarah Mitchell, Financial Advisor"
    },
    {
      name: "Marcus Johnson",
      title: "Investment & Real Estate Specialist",
      description: "Marcus combines his background in finance and real estate to create diversified investment portfolios for elite athletes. His innovative approach to wealth building focuses on long-term assets, passive income streams, and strategic real estate acquisitions that maximize returns while managing risk.",
      imageSrc: "/images/8.png",
      imageAlt: "Marcus Johnson, Financial Strategist"
    }
  ];

  return (
    <Box as="section" id="financial-advice" py={20} bg="white">
      <Container maxW="1240px">
        <AnimatedBox>
          <Box textAlign="center" mb={16}>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="400"
              fontFamily="var(--font-alice), serif !important"
              mb={6}
              color="neutral.900"
            >
              Financial Advisory Team
            </Heading>
            
            <Text
              fontSize="lg"
              maxW="800px"
              mx="auto"
              color="neutral.500"
            >
              Expert financial guidance tailored for professional athletes. Our advisors help you secure your future and make smart investments throughout your career and beyond.
            </Text>
          </Box>
        </AnimatedBox>
        
        <AnimatedBox delay={0.3} distance={40}>
          <Box
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
            borderWidth="1px"
            borderColor="neutral.200"
            p={{ base: 6, md: 10 }}
          >
            <Heading
              as="h3"
              fontSize="3xl"
              mb={8}
              fontWeight="400"
              color="neutral.900"
              textAlign="center"
            >
              Meet Our Financial Experts
            </Heading>
            
            <Flex direction="column" gap={12}>
              {advisors.map((advisor, index) => (
                <AdvisorCard
                  key={advisor.name}
                  {...advisor}
                  isReversed={index % 2 === 1}
                  animationDelay={0.4 + (index * 0.2)}
                />
              ))}
            </Flex>
          </Box>
        </AnimatedBox>
      </Container>
    </Box>
  );
} 