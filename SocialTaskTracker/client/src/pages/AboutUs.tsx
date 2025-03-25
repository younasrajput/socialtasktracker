import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Users, Target, Award, Briefcase, Globe } from 'lucide-react';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About SocialTask Hub</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're on a mission to connect brands with their audience and help content creators monetize their influence.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  SocialTask Hub was founded in 2022 by a team of social media experts and tech entrepreneurs who saw a gap in the market for authentic social media engagement.
                </p>
                <p className="text-gray-600 mb-4">
                  We noticed that brands were struggling to connect with their target audience in an authentic way, while content creators were looking for ways to monetize their influence beyond traditional advertising.
                </p>
                <p className="text-gray-600">
                  Our platform bridges this gap by providing a marketplace where brands can request specific social media tasks, and users can complete these tasks to earn rewards while growing their own online presence.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400&q=80" 
                  alt="Team collaboration" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission & Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Our Mission & Values</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Guided by these core principles, we're building a platform that benefits both creators and brands
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-primary flex items-center justify-center rounded-full mb-5">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community First</h3>
                <p className="text-gray-600">We build for our community of creators and prioritize their success on our platform.</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-full mb-5">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Authentic Engagement</h3>
                <p className="text-gray-600">We believe in real, meaningful interactions that build genuine connections between brands and audiences.</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 text-amber-500 flex items-center justify-center rounded-full mb-5">
                  <Award size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fair Compensation</h3>
                <p className="text-gray-600">We ensure creators are fairly rewarded for their time, influence, and creative contributions.</p>
              </div>
              
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 flex items-center justify-center rounded-full mb-5">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Opportunity</h3>
                <p className="text-gray-600">We're creating income opportunities for creators worldwide, regardless of location or follower count.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Meet Our Leadership Team</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Our diverse team brings together expertise in social media, technology, and business
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300&q=80" 
                  alt="Alexander Mitchell" 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">Alexander Mitchell</h3>
                  <p className="text-primary font-medium">Co-Founder & CEO</p>
                  <p className="mt-3 text-gray-600">Former social media director with 15+ years of industry experience.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300&q=80" 
                  alt="Sophia Rodriguez" 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">Sophia Rodriguez</h3>
                  <p className="text-primary font-medium">Co-Founder & COO</p>
                  <p className="mt-3 text-gray-600">Tech entrepreneur with previous successful startups in the digital space.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300&q=80" 
                  alt="David Kim" 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">David Kim</h3>
                  <p className="text-primary font-medium">CTO</p>
                  <p className="mt-3 text-gray-600">Engineering leader with background in scalable platforms and marketplaces.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
                <p className="text-gray-300">Active Users</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
                <p className="text-gray-300">Tasks Completed</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
                <p className="text-gray-300">Brand Partners</p>
              </div>
              
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">$1M+</div>
                <p className="text-gray-300">Rewards Paid</p>
              </div>
            </div>
          </div>
        </section>

        {/* Careers Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Team</h2>
                <p className="text-gray-600 mb-4">
                  We're always looking for talented individuals who are passionate about social media, technology, and creating value for our community.
                </p>
                <p className="text-gray-600 mb-4">
                  At SocialTask Hub, you'll work in a fast-paced, innovative environment with opportunities to make a real impact on how people interact with social media.
                </p>
                <div className="mt-8">
                  <Button className="bg-primary hover:bg-blue-600 text-white">
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Open Positions
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200&q=80" 
                  alt="Team collaboration" 
                  className="rounded-lg shadow-md"
                />
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200&q=80" 
                  alt="Team meeting" 
                  className="rounded-lg shadow-md"
                />
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200&q=80" 
                  alt="Team working" 
                  className="rounded-lg shadow-md"
                />
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200&q=80" 
                  alt="Office space" 
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to grow your social media presence?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of content creators and businesses using SocialTask Hub to grow their online presence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-8 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/packages">
                <Button size="lg" variant="outline" className="bg-transparent border border-white text-white hover:bg-white/10 px-8 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                  Explore Packages
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AboutUs;
