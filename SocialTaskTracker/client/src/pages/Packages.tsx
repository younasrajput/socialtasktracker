import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { Package } from '@/types';

const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(0)}`;
};

const PackagesPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filterPackages = (packages: Package[] | undefined) => {
    if (!packages) return [];
    
    if (activeTab === 'all') return packages;
    return packages.filter(pkg => pkg.type === activeTab);
  };

  const handleGetStarted = (packageId: number) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    navigate(`/packages/${packageId}`);
  };

  return (
    <>
      <Navbar />
      <main className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Package</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select a package that suits your social media growth goals and budget
            </p>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-12">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="all">All Packages</TabsTrigger>
                <TabsTrigger value="starter">Starter</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 p-6">
                  <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse mt-4"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mt-5"></div>
                  <div className="mt-6 space-y-4">
                    {[1, 2, 3, 4].map(j => (
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filterPackages(packages).map((pkg) => (
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
                      <Button 
                        className="w-full bg-primary hover:bg-blue-600 text-white"
                        onClick={() => handleGetStarted(pkg.id)}
                      >
                        {pkg.type === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center bg-white rounded-lg shadow-sm p-10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need a Custom Package?</h2>
            <p className="text-gray-600 mb-6">
              We offer customized solutions for agencies and businesses with specific requirements.
              Contact our sales team to discuss your needs.
            </p>
            <Button className="bg-primary hover:bg-blue-600 text-white px-8">
              Contact Sales
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PackagesPage;
