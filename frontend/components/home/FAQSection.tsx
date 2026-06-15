'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const faqs = [
  {
    question: 'What photo formats do you support?',
    answer: 'We support JPG, PNG, and JPEG formats. You can upload any photo from your device and we\'ll convert it to the perfect passport photo format.',
  },
  {
    question: 'How does the AI background removal work?',
    answer: 'Our AI uses advanced machine learning models to automatically detect and remove backgrounds with precision. It works on any photo and produces clean, professional results.',
  },
  {
    question: 'Which countries\' passport sizes do you support?',
    answer: 'We support passport photo sizes for 50+ countries including USA (2x2 inch), UK (35x45mm), India, China, Canada, Australia, and many more. All sizes are pre-configured to official government standards.',
  },
  {
    question: 'Is my photo data secure?',
    answer: 'Absolutely! All photos are encrypted during upload and processing. We automatically delete your photos after 24 hours. We never share or sell your data.',
  },
  {
    question: 'Can I use the photos for official documents?',
    answer: 'Yes! Our photos meet official government specifications for passports, visas, and ID cards. However, we recommend checking your specific country\'s latest requirements.',
  },
  {
    question: 'What\'s the difference between Free and Pro plans?',
    answer: 'Free plan allows 5 photos per month with basic features. Pro plan gives you unlimited photos, HD enhancement, all download formats, priority support, and no watermarks.',
  },
  {
    question: 'How do I download my passport photos?',
    answer: 'After editing, click the Download button and choose your preferred format (JPG, PNG, or PDF). You can also download a print-ready sheet with multiple copies.',
  },
  {
    question: 'Can I edit photos on mobile?',
    answer: 'Yes! Our platform is fully responsive and works perfectly on mobile devices, tablets, and desktops. Create passport photos anywhere, anytime.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
          style={{ willChange: 'transform, opacity' }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about our service
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="card"
              style={{ willChange: 'transform, opacity' }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <FiChevronUp className="w-6 h-6 text-primary-600 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <p className="text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
