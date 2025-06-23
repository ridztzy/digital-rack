// app/components/FeaturesSection.js
import React from 'react';
import { ShieldCheck, Zap, Award, Headset } from 'lucide-react';

const FeaturesSection = () => {
    const features = [
        { icon: <Zap size={32} className="text-blue-600 dark:text-blue-500"/>, title: "Akses Instan", description: "Unduh produk langsung setelah pembayaran berhasil." },
        { icon: <Award size={32} className="text-blue-600 dark:text-blue-500"/>, title: "Lisensi Resmi", description: "Semua produk dilengkapi lisensi yang jelas dan aman." },
        { icon: <Headset size={32} className="text-blue-600 dark:text-blue-500"/>, title: "Support Cepat", description: "Tim kami siap membantu Anda jika mengalami kendala." },
        { icon: <ShieldCheck size={32} className="text-blue-600 dark:text-blue-500"/>, title: "Pembayaran Aman", description: "Transaksi aman dengan gateway pembayaran terpercaya." },
    ];

    return (
        <section id="features" className="py-20 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Mengapa Memilih DigiRack?</h3>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Keunggulan yang kami tawarkan untuk kepuasan Anda.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center p-6 bg-slate-50 dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
