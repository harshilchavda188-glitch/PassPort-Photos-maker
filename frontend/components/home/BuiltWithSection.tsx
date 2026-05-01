'use client';

import { motion } from 'framer-motion';
import { FaPython, FaJs, FaHtml5, FaCss3Alt } from 'react-icons/fa';

const technologies = [
  {
    name: 'Python',
    icon: FaPython,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Backend AI Processing',
  },
  {
    name: 'Flask',
    icon: FaPython,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    description: 'Web Framework',
  },
  {
    name: 'HTML5',
    icon: FaHtml5,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    description: 'Structure',
  },
  {
    name: 'CSS3',
    icon: FaCss3Alt,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Styling',
  },
  {
    name: 'JavaScript',
    icon: FaJs,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    description: 'Interactivity',
  },
  {
    name: 'Next.js',
    icon: FaJs,
    color: 'text-white',
    bgColor: 'bg-gray-900 dark:bg-gray-700',
    description: 'React Framework',
  },
];

export default function BuiltWithSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built With
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powered by modern technologies for optimal performance
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${tech.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="flex flex-col items-center gap-3">
                <tech.icon className={`w-12 h-12 ${tech.color}`} />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tech.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-full px-8 py-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                AI-Powered Background Removal
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                50+ Country Standards
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                HD Enhancement
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
