import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <div className="h-8 w-8 bg-primary text-white flex items-center justify-center rounded-md text-lg font-bold">
                    ST
                  </div>
                  <span className="ml-2 text-xl font-bold text-primary">SocialTask Hub</span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <div className={`border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer ${
                  location === "/" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Home
                </div>
              </Link>
              <Link href="/packages">
                <div className={`border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer ${
                  location === "/packages" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  Packages
                </div>
              </Link>
              <Link href="/about">
                <div className={`border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer ${
                  location === "/about" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}>
                  About Us
                </div>
              </Link>
              {user && (
                <Link href="/dashboard">
                  <div className={`border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer ${
                    location === "/dashboard" 
                      ? "border-primary text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}>
                    Dashboard
                  </div>
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Button 
                onClick={signOut}
                variant="outline"
                className="border-primary text-primary hover:bg-blue-50 transition-colors duration-200"
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/signin">
                  <Button className="bg-primary hover:bg-blue-600 text-white transition-colors duration-200 mr-3">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-blue-50 transition-colors duration-200"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, toggle based on menu state */}
      <div className={`sm:hidden transition-all duration-200 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/">
            <div 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
                location === "/"
                  ? "bg-blue-50 border-primary text-primary"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </div>
          </Link>
          <Link href="/packages">
            <div 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
                location === "/packages"
                  ? "bg-blue-50 border-primary text-primary"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Packages
            </div>
          </Link>
          <Link href="/about">
            <div 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
                location === "/about"
                  ? "bg-blue-50 border-primary text-primary"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </div>
          </Link>
          {user && (
            <Link href="/dashboard">
              <div 
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer ${
                  location === "/dashboard"
                    ? "bg-blue-50 border-primary text-primary"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </div>
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4 space-y-2 flex-col">
            {user ? (
              <Button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-primary hover:bg-blue-600 text-white"
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Link href="/signin" className="w-full">
                  <Button 
                    className="w-full bg-primary hover:bg-blue-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-blue-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
