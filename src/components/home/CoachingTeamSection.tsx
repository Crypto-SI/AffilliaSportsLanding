'use client';

import { Box, Text, Container, Heading, VStack, SimpleGrid, Link } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import React, { ReactNode } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

// Define our own simpler animation components (assuming it's available or defined elsewhere)
// If AnimatedBox is defined in FinancialAdviceSection, we might need to extract it or redefine it
const MotionBox = motion(Box);

interface AnimatedBoxProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

// Basic AnimatedBox implementation (replace or import if a shared one exists)
const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  children,
  delay = 0,
  direction = 'up',
  distance = 30
}) => {
  const getInitialProps = () => {
    switch (direction) {
      case 'down': return { opacity: 0, y: -distance };
      case 'left': return { opacity: 0, x: distance };
      case 'right': return { opacity: 0, x: -distance };
      case 'up':
      default: return { opacity: 0, y: distance };
    }
  };
  const getAnimateProps = () => ({ opacity: 1, x: 0, y: 0 });

  return (
    <MotionBox
      initial={getInitialProps()}
      whileInView={getAnimateProps()}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
    >
      {children}
    </MotionBox>
  );
};


interface CoachCardProps {
  name: string;
  position: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  websiteUrl?: string;
  animationDelay?: number;
}

const CoachCard: React.FC<CoachCardProps> = ({
  name,
  position,
  description,
  imageSrc,
  imageAlt,
  websiteUrl,
  animationDelay = 0
}) => {
  return (
    <AnimatedBox delay={animationDelay} direction="up">
      <VStack
        spacing={4}
        align="stretch"
        bg="white"
        borderRadius="xl"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.08)"
        borderWidth="1px"
        borderColor="neutral.200"
        overflow="hidden"
        p={6}
        textAlign="center"
        height="100%" // Ensure cards have equal height
      >
        <Box
          position="relative"
          width="150px" // Adjust size as needed
          height="150px"
          borderRadius="full" // Circular image
          overflow="hidden"
          mx="auto" // Center the image
          mb={2} // Margin below image
          flexShrink={0}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }} // Keep top alignment
            sizes="150px"
            priority // Load images eagerly if they are important
          />
        </Box>
        <Heading
          as="h4"
          fontSize="xl"
          fontWeight="500"
          color="neutral.900"
        >
          {name}
        </Heading>
        <Text
          fontSize="md"
          fontWeight="500"
          color="brand.500"
        >
          {position}
        </Text>
        <Text
          fontSize="sm"
          color="neutral.500"
          flexGrow={1} // Allow description to take available space
        >
          {description}
        </Text>
        {websiteUrl && (
          <Link
            href={websiteUrl}
            isExternal
            color="brand.500"
            textDecoration="underline"
            fontSize="xs"
            mt="auto" // Push link to bottom if needed, works with flexGrow on description
          >
            Learn More <ExternalLinkIcon mx="1px" />
          </Link>
        )}
      </VStack>
    </AnimatedBox>
  );
};

export default function CoachingTeamSection() {
  const coaches = [
    {
      name: "Jude Sterling",
      position: "Head Performance Coach",
      description: "Jude brings over 10 years of experience in elite athlete training, focusing on peak physical conditioning and injury prevention.",
      imageSrc: "/images/jude.png", // Updated image
      imageAlt: "Jude Sterling, Head Performance Coach",
      websiteUrl: "#" // Placeholder link
    },
    {
      name: "Poku Kesse",
      position: "Lead Talent Scout",
      description: "With a keen eye for potential, Poku identifies and nurtures the next generation of football stars across the globe.",
      imageSrc: "/images/poku.png", // Updated image
      imageAlt: "Poku Kesse, Lead Talent Scout"
    },
    {
      name: "Paul Yeadon",
      position: "Technical Skills Coach",
      description: "Paul specializes in refining technical abilities, helping players master ball control, passing, and shooting accuracy.",
      imageSrc: "/images/yeadaz.png", // Updated image
      imageAlt: "Paul Yeadon, Technical Skills Coach",
      websiteUrl: "#" // Placeholder link
    },
    {
      name: "Anton Jacob",
      position: "Youth Development Scout",
      description: "Anton focuses on grassroots talent, identifying promising young players and guiding them through early career stages.",
      imageSrc: "/images/anthon.png", // Updated image
      imageAlt: "Anton Jacob, Youth Development Scout"
    }
  ];

  return (
    <Box as="section" id="coaching-team" py={20} bg="neutral.50"> {/* Slightly different background */}
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
              Coaching & Scouting Team
            </Heading>
            <Text
              fontSize="lg"
              maxW="800px"
              mx="auto"
              color="neutral.500"
            >
              Meet the experts dedicated to maximizing player potential on and off the field. Our coaches and scouts provide top-tier training, development, and talent identification.
            </Text>
          </Box>
        </AnimatedBox>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          {coaches.map((coach, index) => (
            <CoachCard
              key={coach.name}
              {...coach}
              animationDelay={0.2 + (index * 0.15)} // Stagger animation
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
} 