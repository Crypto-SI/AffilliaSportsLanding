'use client';

import { Box, Heading, Text, Container, SimpleGrid, Flex } from '@chakra-ui/react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

type ServiceCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
  index?: number;
};

const ServiceCard = ({ 
  title, 
  description, 
  imageSrc,
  imageAlt,
  accentColor = 'brand.500', 
  bgColor = 'white',
  textColor = 'neutral.500',
  index = 0
}: ServiceCardProps) => {
  const MotionBox = motion.create(Box);
  
  return (
    <MotionBox
      p={8}
      bg={bgColor}
      borderRadius="xl"
      boxShadow="0px 4px 34px rgba(0, 0, 0, 0.1)"
      borderWidth="1px"
      borderColor="neutral.200"
      position="relative"
      height="full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.1 + (index * 0.1),
        ease: [0.250, 0.460, 0.450, 0.940]
      }}
      whileHover={{ 
        y: -5, 
        boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.3 }
      }}
    >
      <Flex mb={6} justify="center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.5, 
            delay: 0.3 + (index * 0.1),
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Box 
            position="relative" 
            width="90px" 
            height="90px" 
            borderRadius="full" 
            overflow="hidden"
            bg={bgColor === 'brand.500' ? 'neutral.800' : accentColor === 'brand.500' ? 'neutral.100' : 'white'} 
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              style={{ 
                objectFit: 'contain',
                padding: '15px' 
              }}
              sizes="90px"
            />
          </Box>
        </motion.div>
      </Flex>
      
      <Heading 
        as="h3" 
        fontSize="2xl" 
        mb={4} 
        fontWeight="400"
        color={bgColor === 'brand.500' ? 'white' : accentColor}
        textAlign="center"
      >
        {title}
      </Heading>
      
      <Text 
        fontSize="md" 
        color={bgColor === 'brand.500' ? 'white' : textColor}
        textAlign="center"
      >
        {description}
      </Text>
    </MotionBox>
  );
};

export default function ServicesSection() {
  return (
    <Box as="section" id="services" py={20} bg="white">
      <Container maxW="1240px">
        <AnimatedSection>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="400"
            mb={16}
            color="neutral.900"
            textAlign="center"
          >
            Our Services
          </Heading>
        </AnimatedSection>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <ServiceCard
            title="Representation"
            description="We provide exclusive representation, acting as the bridge between you and clubs, negotiating your best interests."
            imageSrc="/images/optimized/services/large/services-representation.webp"
            imageAlt="Athlete representation service"
            bgColor="brand.500"
            accentColor="white"
            index={0}
          />
          
          <ServiceCard
            title="Contract Negotiation"
            description="Our expert team secures deals that maximize your value and protect your long-term interests."
            imageSrc="/images/optimized/services/large/services-negotiation.webp"
            imageAlt="Contract negotiation service"
            accentColor="brand.500"
            index={1}
          />
          
          <ServiceCard
            title="Image Rights"
            description="We manage and protect your image rights across all platforms, ensuring you benefit from your personal brand."
            imageSrc="/images/optimized/services/large/services-image-rights.webp"
            imageAlt="Image rights management service"
            accentColor="brand.500"
            index={2}
          />
          
          <ServiceCard
            title="Career Development"
            description="From training guidance to post-career planning, we support your journey throughout your football career and beyond."
            imageSrc="/images/optimized/services/large/services-career-path.webp"
            imageAlt="Career development service"
            accentColor="brand.500"
            index={3}
          />
          
          <ServiceCard
            title="Close Protection"
            description="Specialized high-quality security services for elite players, ensuring safety and privacy both on and off the pitch."
            imageSrc="/images/optimized/services/large/services-protection.webp"
            imageAlt="Close protection security service"
            accentColor="brand.500"
            index={4}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
} 