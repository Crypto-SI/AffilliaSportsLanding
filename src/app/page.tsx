'use client'; // Required for Chakra UI components

import { Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import HighlightsSection from '@/components/home/HighlightsSection';
import AboutSection from '@/components/home/AboutSection';
import ServicesSection from '@/components/home/ServicesSection';
import StatsSection from '@/components/home/StatsSection';
import PhilosophySection from '@/components/home/PhilosophySection';
import PlayerPortalSection from '@/components/home/PlayerPortalSection';
import SplashScreen from '@/components/intro/SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  
  // Always show the splash screen on page load
  // No localStorage check so it shows each time

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Layout>
        <HeroSection />
        <AboutSection />
        <PhilosophySection />
        <PlayerPortalSection />
        <ServicesSection />
        {/* Commented out as requested */}
        {/* <HighlightsSection /> */}
        {/* <StatsSection /> */}
      </Layout>
    </>
  );
}
