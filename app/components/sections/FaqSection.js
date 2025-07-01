'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Bagaimana cara mengunduh produk setelah pembelian?",
      answer: "Setelah pembayaran berhasil, Anda akan langsung menerima email berisi link unduhan produk. Link tersebut juga akan tersedia di halaman riwayat pembelian Anda di dashboard. Anda dapat mengunduh produk kapan saja tanpa batas waktu."
    },
    {
      question: "Metode pembayaran apa saja yang didukung?",
      answer: "Kami mendukung berbagai metode pembayaran untuk kemudahan Anda, termasuk transfer bank (BCA, BNI, BRI, Mandiri), kartu kredit/debit (Visa, Mastercard), e-wallet (GoPay, OVO, DANA, ShopeePay), dan pembayaran di minimarket (Alfamart, Indomaret)."
    },
    {
      question: "Apakah ada garansi atau kebijakan pengembalian?",
      answer: "Karena sifat produk digital yang dapat langsung diunduh, kami tidak menawarkan pengembalian dana. Namun, jika Anda mengalami masalah teknis dengan produk atau file rusak, tim support kami siap membantu Anda 24/7 untuk menyelesaikan masalah tersebut."
    },
    {
      question: "Apakah lisensi produk bisa digunakan untuk komersial?",
      answer: "Ya, sebagian besar produk kami dilengkapi dengan lisensi komersial yang memungkinkan Anda menggunakan produk untuk keperluan bisnis. Namun, setiap produk memiliki ketentuan lisensi yang berbeda. Pastikan untuk membaca detail lisensi pada halaman produk sebelum membeli."
    },
    {
      question: "Bagaimana jika saya butuh bantuan teknis?",
      answer: "Tim customer support kami tersedia 24/7 melalui live chat, email (support@digirack.com), dan WhatsApp. Kami juga memiliki knowledge base lengkap dan video tutorial untuk membantu Anda memaksimalkan penggunaan produk digital yang dibeli."
    },
    {
      question: "Apakah produk akan mendapat update?",
      answer: "Ya, banyak produk kami mendapat update berkala dari creator. Jika produk yang Anda beli mendapat update, Anda akan mendapat notifikasi email dan dapat mengunduh versi terbaru tanpa biaya tambahan melalui dashboard Anda."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan yang paling sering ditanyakan oleh pengguna kami.
            Jika tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Masih ada pertanyaan?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Tim support kami siap membantu Anda 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@digirack.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Email Support
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;