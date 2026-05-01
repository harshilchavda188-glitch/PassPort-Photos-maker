import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          About AI Passport Photo Maker Pro
        </h1>
        
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We make it easy and affordable for everyone to create professional passport photos that meet official requirements. 
              Using cutting-edge AI technology, we ensure your photos are perfect every time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>100% FREE - No hidden costs or subscriptions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>AI-powered background removal</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Support for 50+ countries</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>No login required - Start immediately</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Privacy-first - Photos processed locally</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Technology</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Built with Next.js, TypeScript, and advanced AI libraries. All processing happens in your browser, 
              ensuring your photos stay private and secure.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
