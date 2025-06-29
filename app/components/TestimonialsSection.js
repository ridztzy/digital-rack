// app/components/TestimonialsSection.js
import React from 'react';
import { testimonials } from '../data/db'; // Import data

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Apa Kata Pelanggan Kami?</h3>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Kami bangga telah membantu banyak profesional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-slate-50 dark:bg-gray-900 p-8 rounded-lg shadow-sm">
              <p className="text-gray-700 dark:text-gray-300 italic">{testimonial.quote}</p>
              <div className="mt-6 flex items-center">
                <img 
                  src={testimonial.avatarUrl} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.pravatar.cc/150'; }}
                 />
                <div className="ml-4">
                  <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;