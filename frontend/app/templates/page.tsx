import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Passport Photo Templates
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Choose from 50+ country-specific passport photo templates with exact dimensions and requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { country: 'United States', size: '2x2 inches', bg: 'White' },
            { country: 'United Kingdom', size: '35x45 mm', bg: 'Light grey or cream' },
            { country: 'Canada', size: '50x70 mm', bg: 'White or light-colored' },
            { country: 'India', size: '35x45 mm', bg: 'White or light-colored' },
            { country: 'Australia', size: '35x45 mm', bg: 'Plain light grey' },
            { country: 'Germany', size: '35x45 mm', bg: 'Light neutral' },
          ].map((template) => (
            <div
              key={template.country}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-xl font-semibold mb-2">{template.country}</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>📐 Size: {template.size}</p>
                <p>🎨 Background: {template.bg}</p>
              </div>
              <button className="mt-4 w-full btn-primary">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
