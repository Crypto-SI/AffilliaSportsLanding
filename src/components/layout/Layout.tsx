'use client';

import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Navbar />
      <Box as="main" pt={0}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
} 