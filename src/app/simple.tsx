'use client';

import { Box, Heading, Text, Container } from '@chakra-ui/react';
import Layout from '@/components/layout/Layout';

export default function SimplePage() {
  return (
    <Layout>
      <Box as="section" py={20} bg="white">
        <Container maxW="1240px">
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="400"
            mb={8}
            color="neutral.900"
            textAlign="center"
          >
            Simple Test Page
          </Heading>
          
          <Text fontSize="lg" textAlign="center" mb={8}>
            This is a simplified page to test if the basic structure loads correctly.
          </Text>
          
          <Text textAlign="center">
            <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
              Back to Home
            </a>
          </Text>
        </Container>
      </Box>
    </Layout>
  );
} 