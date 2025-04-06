'use client';

import { Box, Heading, Text, Container, SimpleGrid, Flex, Circle, Icon } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { AnimatedText } from '@/components/ui/AnimatedText';
import { AnimatedImage } from '@/components/ui/AnimatedImage';

type FeatureCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  color: string;
  bgColor?: string;
  index?: number;
};

const FeatureCard = ({ 
  title, 
  description, 
  imageSrc, 
  imageAlt, 
  color, 
  bgColor = 'white',
  index = 0
}: FeatureCardProps) => {
  const MotionBox = motion.create(Box);
  const MotionCircle = motion.create(Circle);
  
  return (
    <MotionBox
      p={6}
      bg={bgColor}
      borderRadius="xl"
      boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
      borderWidth="1px"
      borderColor="neutral.200"
      position="relative"
      overflow="hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.2 + (index * 0.15),
        ease: [0.250, 0.460, 0.450, 0.940]
      }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.3 }
      }}
    >
      <Box 
        position="relative" 
        width="100%" 
        height="200px" 
        mb={6} 
        borderRadius="lg" 
        overflow="hidden"
      >
        <AnimatedImage 
          src={imageSrc}
          alt={imageAlt}
          imageFill={true}
          containerHeight="200px"
          imageStyle={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          effect="zoom"
          duration={0.7}
          delay={0.3 + (index * 0.15)}
        />
      </Box>
      
      <Heading 
        as="h3" 
        fontSize="xl" 
        mb={3} 
        fontWeight="400"
        color={bgColor === 'brand.500' ? 'white' : color}
      >
        {title}
      </Heading>
      
      <Text 
        fontSize="md" 
        color={bgColor === 'brand.500' ? 'white' : 'neutral.500'}
      >
        {description}
      </Text>
      
      {/* Circular accent */}
      <MotionCircle
        size="40px"
        bg="neutral.900"
        position="absolute"
        bottom="15px"
        right="15px"
        opacity={0.8}
        whileHover={{ scale: 1.1, opacity: 1 }}
      >
        <Icon color="white" boxSize={5} />
      </MotionCircle>
    </MotionBox>
  );
};

export default function HighlightsSection() {
  return (
    <Box as="section" id="highlights" py={20} bg="white">
      <Container maxW="1240px">
        <AnimatedSection>
          <Box mb={14}>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="400"
              mb={6}
              color="neutral.900"
            >
              Highlights
            </Heading>
            <AnimatedText delay={0.2}>
              <Text fontSize="lg" maxW="800px" color="neutral.500">
                Affillia Sports is the premier boutique football agency redefining athlete representation.
                Our core values are exclusivity, bespoke service, and holistic athlete care.
              </Text>
            </AnimatedText>
          </Box>
        </AnimatedSection>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <FeatureCard
            color="white"
            bgColor="brand.500"
            title="Contract Negotiation"
            description="Our expert team negotiates the best possible terms for our clients, ensuring they receive contracts that reflect their true value."
            imageSrc="/images/optimized/highlights/large/highlights-contract-negotiation.webp"
            imageAlt="Contract negotiation in progress with football club"
            index={0}
          />
          
          <FeatureCard
            color="brand.500"
            title="Career Development"
            description="We provide comprehensive training and mentorship to help our athletes reach their full potential both on and off the field."
            imageSrc="/images/optimized/highlights/large/highlights-career-development.webp"
            imageAlt="Player training with professional coach guidance"
            index={1}
          />
          
          <FeatureCard
            color="brand.500"
            title="Media Relations"
            description="With our extensive media connections, we help athletes build their personal brand and navigate public relations effectively."
            imageSrc="/images/optimized/highlights/large/highlights-media-relations.webp"
            imageAlt="Player at a press conference speaking to media"
            index={2}
          />
        </SimpleGrid>
      </Container>
      
      {/* Media Access Section */}
      <Box id="media-access" py={10}>
        <Container maxW="1240px">
          <AnimatedSection direction="right">
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="400"
              mb={6}
              color="neutral.900"
            >
              Amplifying Athlete Voices
            </Heading>
            <AnimatedText delay={0.2}>
              <Text fontSize="lg" maxW="800px" mb={10} color="neutral.500">
                Affillia Sports is uniquely positioned to offer media opportunities that elevate careers. 
                With James Flood's journalism expertise, our clients gain access to top-tier press, 
                interviews, and reputation management.
              </Text>
            </AnimatedText>
          </AnimatedSection>
        </Container>
      </Box>
      
      {/* Resources Section */}
      <Box id="resources" py={10} bg="neutral.50">
        <Container maxW="1240px">
          <AnimatedSection direction="left">
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="400"
              mb={6}
              color="neutral.900"
            >
              Resources
            </Heading>
            <AnimatedText delay={0.2}>
              <Text fontSize="lg" maxW="800px" mb={10} color="neutral.500">
                Stay informed with our latest articles on football trends, career advice, and FIFA regulations.
                We provide resources for those interested in sports management careers.
              </Text>
            </AnimatedText>
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
} 