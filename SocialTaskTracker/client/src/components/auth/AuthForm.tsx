import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { SignInData, SignUpData } from '@/lib/firebase';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number must be valid').max(15, 'Phone number is too long'),
  country: z.string().min(2, 'Country must be valid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string().min(6, 'Password confirmation must be at least 6 characters'),
  referralCode: z.string().optional(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"]
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

type AuthFormProps = {
  type: 'signin' | 'signup';
};

const AuthForm = ({ type }: AuthFormProps) => {
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [, navigate] = useLocation();
  const [showReferralField, setShowReferralField] = useState(false);

  const form = useForm<SignInFormValues | SignUpFormValues>({
    resolver: zodResolver(type === 'signin' ? signInSchema : signUpSchema),
    defaultValues: type === 'signin' 
      ? { email: '', password: '' } 
      : { 
          fullName: '', 
          username: '',
          email: '', 
          phone: '', 
          country: '', 
          password: '', 
          passwordConfirm: '', 
          referralCode: '' 
        },
  });
  
  const signInMutation = useMutation({
    mutationFn: async (data: SignInFormValues) => {
      return await signIn(data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You are now signed in.",
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormValues) => {
      // Transform form data to SignUpData format
      const signUpData: SignUpData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        username: data.username,
        phone: data.phone,
        country: data.country,
        referralCode: data.referralCode
      };
      return await signUp(signUpData);
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Please select a package to continue.",
      });
      navigate('/packages');
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      return await signInWithGoogle();
    },
    onSuccess: () => {
      toast({
        title: "Google sign-in successful!",
        description: "You are now signed in with Google.",
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignInFormValues | SignUpFormValues) => {
    if (type === 'signin') {
      signInMutation.mutate(data as SignInFormValues);
    } else {
      signUpMutation.mutate(data as SignUpFormValues);
    }
  };

  const handleGoogleSignIn = () => {
    googleSignInMutation.mutate();
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        {type === 'signin' ? 'Sign In to Your Account' : 'Create a New Account'}
      </h2>
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mb-4 flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={googleSignInMutation.isPending}
      >
        {googleSignInMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="h-5 w-5" />
        )}
        Continue with Google
      </Button>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {type === 'signup' && (
            <>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {type === 'signup' && (
            <>
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showReferralField ? (
                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter referral code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => setShowReferralField(true)}>
                  Have a referral code? Click to enter
                </div>
              )}
            </>
          )}
          
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-blue-600"
            disabled={signInMutation.isPending || signUpMutation.isPending}
          >
            {(signInMutation.isPending || signUpMutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              type === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm">
        {type === 'signin' ? (
          <>
            Don't have an account?{' '}
            <Link href="/signup">
              <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                Sign up
              </span>
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/signin">
              <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                Sign in
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;