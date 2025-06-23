// app/components/HeroSection.js
// Ini adalah Server Component, tidak perlu 'use client'
import React from 'react';

const HeroSection = () => {
  return (
    <section id="hero" className="bg-slate-50 dark:bg-gray-900 py-20 sm:py-28">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Tingkatkan Bisnis Anda dengan <span className="text-blue-600 dark:text-blue-500">Produk Digital Premium</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Akses instan ke ribuan template, e-book, dan software berkualitas tinggi untuk mempercepat pertumbuhan bisnis Anda.
          </p>
          <a href="#products" className="mt-8 inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300">
            Lihat Produk
          </a>
        </div>
        <div className="flex justify-center md:justify-end">
  <img 
    src="../assets/hero-image.png" 
    alt="Ilustrasi Produk Digital" 
    className="rounded-lg shadow-2xl w-full max-w-md md:max-w-lg"
    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/E0E7FF/1E40AF?text=Image+Error'; }}
  />
</div>
      </div>
    </section>
  );
};

export default HeroSection;