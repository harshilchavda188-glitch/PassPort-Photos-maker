'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCamera, FiUpload, FiDownload, FiShield } from 'react-icons/fi';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ willChange: 'transform, opacity' }}
          >
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Passport-Size-Image-<span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Maker</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Say goodbye to the hassle of creating passport size images for your professional documents. This web app uses cutting-edge technology to remove backgrounds and add solid background colors, so you can easily create perfect images in seconds!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/editor" className="btn-primary text-center text-lg px-8 py-4">
                Create Your Photo Now
              </Link>
              <Link href="/features" className="btn-outline text-center text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FiShield className="w-5 h-5 text-green-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCamera className="w-5 h-5 text-primary-500" />
                <span>50+ Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <FiDownload className="w-5 h-5 text-blue-500" />
                <span>Instant Download</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-float">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 rounded-xl flex items-center justify-center">
                <FiCamera className="w-32 h-32 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">AI Processing</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
