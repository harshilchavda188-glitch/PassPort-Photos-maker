import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import BuiltWithSection from '@/components/home/BuiltWithSection';
import HowItWorks from '@/components/home/HowItWorks';
import FAQSection from '@/components/home/FAQSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <BuiltWithSection />
      <HowItWorks />
      <FAQSection />
      <Footer />
    </main>
  );
}
