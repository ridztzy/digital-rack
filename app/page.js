// app/page.js
// Ini adalah halaman utama Anda.
// Secara default, ini adalah Server Component, yang bagus untuk SEO dan performa.
'use client';


import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ProductsSection from './components/ProductsSection';
import TestimonialsSection from './components/TestimonialsSection';
import FaqSection from './components/FaqSection';
import FinalCtaSection from './components/FinalCtaSection';

export default function Home() {
  return (
    // Tag <main> dipindahkan ke layout.js agar lebih konsisten
    <>
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
