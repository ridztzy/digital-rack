import React from 'react';
import { Zap, Shield, Award, Headphones, Download, Clock, Users, Star } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Akses Instan",
      description: "Download produk langsung setelah pembayaran berhasil. Tidak perlu menunggu lama.",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Pembayaran Aman",
      description: "Transaksi aman dengan enkripsi SSL dan gateway pembayaran terpercaya.",
      color: "text-green-500"
    },
    {
      icon: Award,
      title: "Kualitas Premium",
      description: "Semua produk telah dikurasi dan diverifikasi untuk memastikan kualitas terbaik.",
      color: "text-purple-500"
    },
    {
      icon: Headphones,
      title: "Support 24/7",
      description: "Tim customer service kami siap membantu Anda kapan saja melalui berbagai channel.",
      color: "text-blue-500"
    },
    {
      icon: Download,
      title: "Download Unlimited",
      description: "Sekali beli, download selamanya. Tidak ada batasan jumlah download.",
      color: "text-indigo-500"
    },
    {
      icon: Clock,
      title: "Update Berkala",
      description: "Dapatkan update produk terbaru secara otomatis tanpa biaya tambahan.",
      color: "text-orange-500"
    },
    {
      icon: Users,
      title: "Komunitas Aktif",
      description: "Bergabung dengan komunitas pengguna untuk berbagi tips dan trik.",
      color: "text-pink-500"
    },
    {
      icon: Star,
      title: "Rating Tinggi",
      description: "Produk dengan rating tinggi dari ribuan pengguna yang puas.",
      color: "text-red-500"
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mengapa Memilih DigiRidz?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Kami berkomitmen memberikan pengalaman terbaik dalam berbelanja produk digital
            dengan fitur-fitur unggulan yang tidak akan Anda temukan di tempat lain.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-900 shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 mr-2" />
            Dipercaya oleh 50,000+ pengguna di seluruh Indonesia
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;