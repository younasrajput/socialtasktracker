import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Complete Social Media Tasks, Earn Rewards
            </h1>
            <p className="text-lg mb-8 text-blue-100">
              Join our community to complete simple social media tasks and earn rewards. Connect with brands and grow your influence.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-6 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-6 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-6 rounded-md text-base font-semibold transition-colors duration-200">
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400&q=80" 
              alt="People collaborating" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
