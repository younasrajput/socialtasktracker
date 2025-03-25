import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User as AppUser } from '@/types';
import { 
  auth, 
  onAuthChange, 
  getCurrentUserToken, 
  signOut as firebaseSignOut,
  SignUpData,
  SignInData,
  signUp as firebaseSignUp,
  signIn as firebaseSignIn,
  signInWithGoogle as firebaseSignInWithGoogle
} from '@/lib/firebase';

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  signIn: (credentials: SignInData) => Promise<AppUser>;
  signUp: (userData: SignUpData) => Promise<AppUser>;
  signInWithGoogle: () => Promise<AppUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  // Check for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          // Get the user's ID token
          const idToken = await getCurrentUserToken();
          
          if (idToken) {
            // Fetch user details from our API
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              // Transform Firebase user data to our app's User type
              setUser({
                id: parseInt(data.user.uid, 10) || 0, // Firebase UIDs are strings, convert as needed
                username: data.user.username,
                email: data.user.email,
                fullName: data.user.fullName,
                profilePicture: data.user.profilePicture || null,
                referralCode: data.user.referralCode,
                referredBy: data.user.referredBy || null,
                createdAt: new Date()
              });
            } else {
              // If we can't get user details, sign out from Firebase
              await firebaseSignOut();
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signUp = async (userData: SignUpData): Promise<AppUser> => {
    try {
      const result = await firebaseSignUp(userData);
      
      // Transform the response to our app's User type
      const appUser: AppUser = {
        id: parseInt(result.user.uid, 10) || 0,
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.fullName,
        profilePicture: null,
        referralCode: result.user.referralCode,
        referredBy: null,
        createdAt: new Date()
      };
      
      setUser(appUser);
      return appUser;
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (credentials: SignInData): Promise<AppUser> => {
    try {
      const result = await firebaseSignIn(credentials);
      
      // Transform the response to our app's User type
      const appUser: AppUser = {
        id: parseInt(result.user.uid, 10) || 0,
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.fullName,
        profilePicture: null,
        referralCode: result.user.referralCode,
        referredBy: null,
        createdAt: new Date()
      };
      
      setUser(appUser);
      return appUser;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<AppUser> => {
    try {
      const result = await firebaseSignInWithGoogle();
      
      // Transform the response to our app's User type
      const appUser: AppUser = {
        id: parseInt(result.user.uid, 10) || 0,
        username: result.user.username,
        email: result.user.email,
        fullName: result.user.fullName,
        profilePicture: null,
        referralCode: result.user.referralCode,
        referredBy: null,
        createdAt: new Date()
      };
      
      setUser(appUser);
      return appUser;
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      
      // Clear any user-related queries from the cache
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
