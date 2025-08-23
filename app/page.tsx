'use client';

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import PlayerPortalSection from '@/components/home/PlayerPortalSection';
import ServicesSection from '@/components/home/ServicesSection';
import FinancialAdviceSection from '@/components/home/FinancialAdviceSection';
import CoachingTeamSection from '@/components/home/CoachingTeamSection';
// import AIScoutSection from '@/components/home/AIScoutSection';
// import ContactSection from '@/components/home/ContactSection';
import PlayerApplicationSection from '@/components/home/PlayerApplicationSection';


export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <AboutSection />
      <PlayerPortalSection />
      <ServicesSection />
      <FinancialAdviceSection />
      <CoachingTeamSection />
      {/* <AIScoutSection /> */}
      <PlayerApplicationSection />
      {/* <ContactSection /> */}
    </Layout>
  );
}
