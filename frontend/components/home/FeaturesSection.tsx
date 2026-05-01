'use client';

import { motion } from 'framer-motion';
import { FiCamera, FiScissors, FiImage, FiDownload, FiShield, FiGlobe } from 'react-icons/fi';

const features = [
  {
    icon: FiCamera,
    title: 'AI Background Removal',
    description: 'Automatically remove backgrounds with precision AI technology for clean, professional photos.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FiScissors,
    title: 'Smart Passport Cropping',
    description: 'Auto-detect faces and crop to exact passport standards for 50+ countries worldwide.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: FiImage,
    title: 'HD Photo Enhancement',
    description: 'Transform low-quality images into professional HD photos with AI enhancement.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: FiDownload,
    title: 'Multiple Download Formats',
    description: 'Download your photos in JPG, PNG, or PDF formats, ready for printing.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: FiShield,
    title: 'Privacy & Security',
    description: 'Your photos are encrypted and automatically deleted after processing. 100% secure.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: FiGlobe,
    title: '50+ Country Templates',
    description: 'Pre-configured passport size templates for USA, UK, India, China, and more countries.',
    color: 'from-teal-500 to-teal-600',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful AI Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to create perfect passport photos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
