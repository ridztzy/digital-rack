import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Award } from 'lucide-react';

const CtaSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full blur-lg"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Siap Mengembangkan Bisnis Anda ke Level Selanjutnya?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            Bergabunglah dengan ribuan profesional yang telah mempercayai DigiRack 
            untuk mendapatkan produk digital berkualitas tinggi dan mengembangkan bisnis mereka.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">50K+</div>
              <div className="text-blue-100 text-sm">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">10K+</div>
              <div className="text-blue-100 text-sm">Produk Premium</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">4.9/5</div>
              <div className="text-blue-100 text-sm">Rating Pengguna</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
            >
              Mulai Berbelanja Sekarang
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100 text-sm mb-4">Dipercaya oleh perusahaan terkemuka:</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Logo placeholders - replace with actual company logos */}
              <div className="text-white font-semibold">TechCorp</div>
              <div className="text-white font-semibold">DesignStudio</div>
              <div className="text-white font-semibold">StartupHub</div>
              <div className="text-white font-semibold">CreativeAgency</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;