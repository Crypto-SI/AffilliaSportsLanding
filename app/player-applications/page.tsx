'use client';

import { Box } from '@chakra-ui/react';
import Layout from '@/components/layout/Layout';
import PlayerApplicationSection from '@/components/home/PlayerApplicationSection';

export default function PlayerApplicationsPage() {
  return (
    <Layout>
      <Box pt={20}> {/* Add padding to account for fixed navbar */}
        <PlayerApplicationSection />
      </Box>
    </Layout>
  );
} 