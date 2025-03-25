import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import PopularPackages from '@/components/home/PopularPackages';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';
import Layout from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Home = () => {
  return (
    <>
      <Layout />
      <main>
        <Hero />
        <Features />
        <PopularPackages />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

export default Home;
