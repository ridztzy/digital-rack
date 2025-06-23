// app/components/Footer.js
import React from 'react';
import { Instagram, Linkedin, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h4 className="text-xl font-bold text-white mb-4">DigiRack</h4>
                <p className="text-gray-400">Platform terpercaya untuk semua kebutuhan produk digital Anda.</p>
            </div>
            <div>
                <h5 className="font-semibold text-white mb-4">Navigasi</h5>
                <ul className="space-y-2">
                    <li><a href="#features" className="hover:text-blue-500 transition-colors">Keunggulan</a></li>
                    <li><a href="#products" className="hover:text-blue-500 transition-colors">Produk</a></li>
                    <li><a href="#contact" className="hover:text-blue-500 transition-colors">Kontak</a></li>
                </ul>
            </div>
            <div>
                <h5 className="font-semibold text-white mb-4">Legal</h5>
                <ul className="space-y-2">
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Syarat & Ketentuan</a></li>
                    <li><a href="#" className="hover:text-blue-500 transition-colors">Kebijakan Privasi</a></li>
                </ul>
            </div>
            <div>
                <h5 className="font-semibold text-white mb-4">Hubungi Kami</h5>
                <p className="text-gray-400">support@digirack.com</p>
                <div className="flex space-x-4 mt-4">
                    <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors"><Instagram size={20} /></a>
                    <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors"><Linkedin size={20} /></a>
                    <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-blue-600 transition-colors"><MessageSquare size={20} /></a>
                </div>
            </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} DigiRack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;