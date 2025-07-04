'use client';

import { Box, Text, Container, Heading, VStack, SimpleGrid, Link } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import React, { ReactNode } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

// Define our own simpler animation components (assuming it's available or defined elsewhere)
// If AnimatedBox is defined in FinancialAdviceSection, we might need to extract it or redefine it
const MotionBox = motion.create(Box);

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
            style={{ 
              objectFit: 'cover', 
              objectPosition: imageSrc.includes('qm.png') ? 'center center' : 'center top' 
            }}
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
      name: 'Jude Stirling',
      position: 'Coach/Scout - London Elite M/F U6s/U16s',
      description: "Jude is one of the directors of London Elite, based in Broadwater farm north london, with a spectacular catchment area, having coached dozens of professionals, Judes commitment to giving pro footballers the best start is unwaivering, along with his fathers Classford Stirling MBE.",
      imageSrc: '/images/jude.png',
      imageAlt: 'Jude Stirling, Coach/Scout',
      websiteUrl: "#"
    },
    {
      name: "Poku Kesse",
      position: "Lead Talent Scout",
      description: "Poku's journey in football reached high semi pro level, but it was his love for fitness and business where he really shone, having cultivated his own personal training business over many years he joins Affillia Sports as a qualified football scout, with extensive ties to West african football. His experience of multiple cultures and their business settings makes him invaluable in our mission",
      imageSrc: "/images/POKU.png",
      imageAlt: "Poku Kesse, Lead Talent Scout"
    },
    {
      name: "You?",
      position: "Future Collaborator - High Agency Prospect",
      description: "This spot could be yours! We're looking to collaborate with ambitious, high-agency individuals in the football world. If you are proactive, passionate, and want to make a real impact, reach out to us. Let's build something great together.",
      imageSrc: "/images/qm.png",
      imageAlt: "Your photo here - Join our team!",
      websiteUrl: "mailto:info@affilliasports.com"
    },
    {
      name: "Anton Jacob",
      position: "Manager",
      description: "Anton is a highly respected coach from east anglia, having coached many young professionals and an incredible amount of academy level prospects, Anton is advancing his managerial career. Qualified to Uefa B level, he's currently studying for his A while managing in the English Non-league",
      imageSrc: "/images/anthon.png",
      imageAlt: "Anton Jacob, Manager"
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
              Coaching and Scouting Connections
            </Heading>
            <Text
              fontSize="lg"
              maxW="800px"
              mx="auto"
              color="neutral.500"
            >
              Meet the experts who we trust, we work closely with these people to ensure our clients get the best service and that we identify the absolute best opportunites.
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