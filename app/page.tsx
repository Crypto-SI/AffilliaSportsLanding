'use client';

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import PlayerPortalSection from '@/components/home/PlayerPortalSection';
import ServicesSection from '@/components/home/ServicesSection';
import FinancialAdviceSection from '@/components/home/FinancialAdviceSection';
import CoachingTeamSection from '@/components/home/CoachingTeamSection';
import PlayerApplicationSection from '@/components/home/PlayerApplicationSection';
import AIScoutSection from '@/components/home/AIScoutSection';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <AboutSection />
      <PlayerPortalSection />
      <AIScoutSection />
      <ServicesSection />
      <FinancialAdviceSection />
      <CoachingTeamSection />
      <PlayerApplicationSection />
    </Layout>
  );
}
