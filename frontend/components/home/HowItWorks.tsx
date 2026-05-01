'use client';

import { motion } from 'framer-motion';
import { FiUpload, FiEdit3, FiDownload } from 'react-icons/fi';

const steps = [
  {
    icon: FiUpload,
    title: 'Upload Your Photo',
    description: 'Upload any photo from your device. We support JPG, PNG, and JPEG formats.',
    number: '01',
  },
  {
    icon: FiEdit3,
    title: 'AI Edits Automatically',
    description: 'Our AI removes the background, detects your face, and crops to passport standards.',
    number: '02',
  },
  {
    icon: FiDownload,
    title: 'Download & Print',
    description: 'Download your perfect passport photo in multiple formats, ready for printing.',
    number: '03',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Create professional passport photos in 3 simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="card text-center">
                <div className="text-6xl font-bold text-primary-200 dark:text-primary-900 absolute top-4 right-4">
                  {step.number}
                </div>
                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary-300 dark:bg-primary-700"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
