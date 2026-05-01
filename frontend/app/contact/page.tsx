import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="How can we help?"
                />
              </div>
              
              <button type="submit" className="w-full btn-primary">
                Send Message
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">support@aipassportpro.com</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tech City, TC 12345</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
