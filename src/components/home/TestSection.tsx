'use client';

import { Box, Container, Heading } from '@chakra-ui/react';

export default function TestSection() {
  return (
    <Box as="section" py={20} bg="red.500">
      <Container maxW="1240px">
        <Box textAlign="center">
          <Heading
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
            fontWeight="400"
            mb={6}
            color="white"
          >
            🚀 NEW TEST SECTION IS WORKING! 🚀
          </Heading>
        </Box>
      </Container>
    </Box>
  );
} 