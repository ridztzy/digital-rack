import React from 'react';
import Link from 'next/link';
import { Instagram, Linkedin, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'Tentang Kami', href: '/about' },
      { label: 'Karir', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press Kit', href: '/press' },
    ],
    support: [
      { label: 'Pusat Bantuan', href: '/help' },
      { label: 'Kontak', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Status Layanan', href: '/status' },
    ],
    legal: [
      { label: 'Syarat & Ketentuan', href: '/terms' },
      { label: 'Kebijakan Privasi', href: '/privacy' },
      { label: 'Kebijakan Cookie', href: '/cookies' },
      { label: 'Lisensi', href: '/license' },
    ],
    products: [
      { label: 'Template Design', href: '/products?category=template' },
      { label: 'E-book', href: '/products?category=ebook' },
      { label: 'Software', href: '/products?category=software' },
      { label: 'Plugin', href: '/products?category=plugin' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/digiridz', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/digiridz', label: 'LinkedIn' },
    { icon: MessageSquare, href: 'https://wa.me/6281234567890', label: 'WhatsApp' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DR</span>
              </div>
              <span className="text-xl font-bold text-white">DigiRidz</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Platform terpercaya untuk semua kebutuhan produk digital Anda. 
              Temukan template, e-book, software, dan plugin berkualitas tinggi 
              untuk mengembangkan bisnis Anda.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@digiridz.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h5 className="font-semibold text-white mb-4">Produk</h5>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="font-semibold text-white mb-4">Perusahaan</h5>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-semibold text-white mb-4">Dukungan</h5>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-semibold text-white mb-4">Legal</h5>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md">
            <h5 className="font-semibold text-white mb-2">Newsletter</h5>
            <p className="text-gray-400 text-sm mb-4">
              Dapatkan update produk terbaru dan penawaran khusus
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            <p>&copy; {currentYear} DigiRidz. Semua hak dilindungi.</p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors group"
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;