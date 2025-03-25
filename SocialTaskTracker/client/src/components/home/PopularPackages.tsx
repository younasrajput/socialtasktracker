import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Package } from '@/types';

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};

const PopularPackages = () => {
  const { user } = useAuth();
  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-56 bg-gray-200 rounded-md animate-pulse mx-auto"></div>
            <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse mx-auto mt-4"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 p-6">
                <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse mt-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mt-5"></div>
                <div className="mt-6 space-y-4">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="flex items-start">
                      <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse ml-3"></div>
                    </div>
                  ))}
                </div>
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse mt-8"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Most Popular Packages</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Choose a package that fits your social media goals and budget
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`bg-white rounded-xl overflow-hidden shadow-md ${pkg.isPopular ? 'border-2 border-primary relative' : 'border border-gray-100'}`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 inset-x-0">
                  <div className="bg-primary text-white text-xs font-semibold py-1 text-center uppercase tracking-wide">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`p-6 border-b border-gray-100 ${pkg.isPopular ? 'pt-7' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                <div className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">{formatPrice(pkg.price)}</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="mt-5 text-gray-500">{pkg.description}</p>
              </div>
              
              <div className="px-6 pt-6 pb-8">
                <ul className="space-y-4">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 text-green-500">
                        <Check size={18} />
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  {user ? (
                    <Link href={`/packages/${pkg.id}`}>
                      <Button className="w-full bg-primary hover:bg-blue-600 text-white transition-colors duration-200">
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signup">
                      <Button className="w-full bg-primary hover:bg-blue-600 text-white transition-colors duration-200">
                        Sign Up & Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/packages">
            <div className="text-primary font-medium hover:text-blue-700 inline-flex items-center cursor-pointer">
              View all packages
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularPackages;
