import Link from 'next/link';
import { FiCamera, FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FiCamera className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">Passport-Size-Image-Maker</span>
            </div>
            <p className="text-gray-400 text-sm">
              Say goodbye to the hassle of creating passport size images. Built with Python, Flask, HTML, CSS & JavaScript for perfect photos in seconds.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link href="/templates" className="text-gray-400 hover:text-white transition-colors text-sm">Templates</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <FiMail className="w-4 h-4" />
                <span>support@aipassportpro.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <FiPhone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2 text-gray-400 text-sm">
                <FiMapPin className="w-4 h-4 mt-1" />
                <span>123 AI Street, Tech City, TC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Passport-Size-Image-Maker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
