'use client';

import React from 'react';
import HeroSection from './components/sections/HeroSection';
import FeaturesSection from './components/sections/FeaturesSection';
import ProductsSection from './components/sections/ProductsSection';
import TestimonialsSection from './components/sections/TestimonialsSection';
import FaqSection from './components/sections/FaqSection';
import CtaSection from './components/sections/CtaSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}