// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TechnologySection from '@/components/sections/TechnologySection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import FooterSection from '@/components/sections/FooterSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TechnologySection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </>
  );
}