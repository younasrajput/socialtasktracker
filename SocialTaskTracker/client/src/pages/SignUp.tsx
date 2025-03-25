import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/context/AuthContext';

const SignUp = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 py-16 min-h-screen flex items-center">
        <div className="max-w-md mx-auto w-full px-4 sm:px-6">
          <AuthForm type="signup" />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SignUp;
