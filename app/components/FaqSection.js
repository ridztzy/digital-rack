// app/components/FaqSection.js
"use client"; // Diperlukan karena menggunakan useState

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqData } from '../data/db'; // Import data

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 bg-slate-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Pertanyaan Umum (FAQ)</h3>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Jawaban untuk pertanyaan yang paling sering diajukan.</p>
                </div>
                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center text-left p-6 font-semibold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                                <span>{faq.question}</span>
                                <ChevronDown 
                                    className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                                    size={24}
                                />
                            </button>
                            <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
                            >
                                <div className="p-6 pt-0 text-gray-600 dark:text-gray-300">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;