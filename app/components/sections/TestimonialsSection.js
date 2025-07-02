import React from 'react';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Andi Pratama",
      role: "Graphic Designer",
      company: "Creative Studio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      content: "DigiRidz benar-benar mengubah cara kerja saya. Template-template yang tersedia sangat berkualitas dan menghemat waktu saya hingga 70%. Highly recommended!",
      rating: 5
    },
    {
      id: 2,
      name: "Sari Indah",
      role: "Digital Marketer",
      company: "Marketing Pro",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      content: "Sebagai digital marketer, saya butuh tools yang cepat dan efektif. E-book dan software dari DigiRidz membantu saya meningkatkan conversion rate klien hingga 150%.",
      rating: 5
    },
    {
      id: 3,
      name: "Budi Santoso",
      role: "Web Developer",
      company: "Tech Solutions",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      content: "Plugin dan tools development yang ada di DigiRidz sangat membantu project saya. Kualitasnya premium tapi harganya sangat terjangkau. Customer service juga responsif.",
      rating: 5
    },
    {
      id: 4,
      name: "Maya Putri",
      role: "Content Creator",
      company: "Creative Hub",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      content: "Koleksi template dan asset di DigiRidz sangat lengkap. Saya bisa membuat konten yang menarik dengan mudah. Platform ini wajib dimiliki setiap content creator!",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Apa Kata Pengguna Kami?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ribuan profesional telah mempercayai DigiRidz untuk mengembangkan bisnis mereka.
            Simak testimoni mereka di bawah ini.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                <Quote className="w-8 h-8 text-blue-600" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">Pengguna Aktif</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">4.9/5</div>
            <div className="text-gray-600 dark:text-gray-400">Rating Rata-rata</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">Produk Digital</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;