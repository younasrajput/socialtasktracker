import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const CTASection = () => {
  const { user } = useAuth();

  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to grow your social media presence?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join thousands of content creators and businesses using SocialTask Hub to grow their online presence.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-8 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-8 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                  Get Started for Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-transparent border border-white text-white hover:bg-white/10 px-8 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                Schedule a Demo
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
