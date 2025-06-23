// app/components/FinalCtaSection.js
import React from 'react';

const FinalCtaSection = () => {
    return (
        <section id="cta" className="py-20 bg-blue-600">
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-3xl font-bold text-white">Siap Memulai Proyek Anda?</h3>
                <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
                    Beli sekarang dan mulai unduh produk digital favoritmu hari ini untuk membawa proyekmu ke level selanjutnya!
                </p>
                <a href="#products" className="mt-8 inline-block bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                    Beli Sekarang
                </a>
            </div>
        </section>
    )
}

export default FinalCtaSection;