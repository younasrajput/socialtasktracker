import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { NotificationType } from '@/types';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.socialtaskhub.com';

// Authentication functions
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
  phone: string;
  country: string;
  referralCode?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    fullName: string;
    username: string;
    referralCode: string;
    isApproved: boolean;
    role?: string;
  };
  token?: string;
  message: string;
}

/**
 * Register a new user using the Worker API
 */
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    // First create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // Then send the additional user data to our Worker API
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      // If our API signup fails, delete the Firebase user to maintain consistency
      await user.delete();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to complete registration');
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login using email and password
 */
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // Get user details from our Worker API
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user details');
    }
    
    const userData = await response.json();
    
    return {
      user: userData.user,
      token: idToken,
      message: 'Login successful'
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    // Sign in with Google via Firebase Authentication
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // Check if the user exists in our database via the Worker API
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    // If the user doesn't exist in our database, we need to create them
    if (response.status === 404) {
      // Extract name parts from Google user info
      const fullName = user.displayName || '';
      const email = user.email || '';
      const username = email.split('@')[0]; // Basic username from email
      
      // Create user in our database
      const createResponse = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          email,
          fullName,
          username,
          // These fields would need to be collected after Google sign-in
          // For now, we'll use placeholders
          phone: '',
          country: '',
          password: '' // Not used with Google Auth
        })
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create user after Google sign-in');
      }
      
      const userData = await createResponse.json();
      return userData;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user details after Google sign-in');
    }
    
    const userData = await response.json();
    
    return {
      user: userData.user,
      token: idToken,
      message: 'Google sign-in successful'
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Google sign-in failed');
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Sign out failed');
  }
};

/**
 * Get the current authenticated user's ID token
 */
export const getCurrentUserToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

/**
 * Set up an auth state change listener
 */
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Create a new notification for a user
 * @param userId - User ID for the notification recipient
 * @param type - Type of notification (alert, success, payment, referral, system)
 * @param title - Notification title
 * @param message - Notification message
 * @returns Promise with notification document reference
 */
export const createNotification = async (
  userId: string | number,
  type: 'alert' | 'success' | 'payment' | 'referral' | 'system',
  title: string,
  message: string
): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      userId: userId.toString(), // Convert to string in case userId is a number
      type,
      title,
      message,
      createdAt: serverTimestamp(),
      read: false
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
};

/**
 * Send a task assignment notification
 */
export const sendTaskAssignmentNotification = async (
  userId: string | number,
  taskTitle: string
): Promise<string> => {
  return createNotification(
    userId,
    'alert',
    'New Task Available',
    `A new task "${taskTitle}" has been assigned to you.`
  );
};

/**
 * Send a task completion notification
 */
export const sendTaskCompletionNotification = async (
  userId: string | number,
  taskTitle: string,
  reward: number
): Promise<string> => {
  const formattedReward = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(reward / 100); // Convert cents to dollars
  
  return createNotification(
    userId,
    'success',
    'Task Completed',
    `You have successfully completed the task "${taskTitle}" and earned ${formattedReward}.`
  );
};

/**
 * Send a payment notification
 */
export const sendPaymentNotification = async (
  userId: string | number,
  amount: number,
  paymentType: string
): Promise<string> => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount / 100); // Convert cents to dollars
  
  return createNotification(
    userId,
    'payment',
    'Payment Processed',
    `Your ${paymentType} payment of ${formattedAmount} has been processed successfully.`
  );
};

/**
 * Send a referral notification
 */
export const sendReferralNotification = async (
  userId: string | number,
  referredUsername: string,
  bonus: number
): Promise<string> => {
  const formattedBonus = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(bonus / 100); // Convert cents to dollars
  
  return createNotification(
    userId,
    'referral',
    'Referral Bonus',
    `${referredUsername} signed up using your referral code. You earned a bonus of ${formattedBonus}!`
  );
};

/**
 * Send a system notification (for general announcements)
 */
export const sendSystemNotification = async (
  userId: string | number,
  title: string,
  message: string
): Promise<string> => {
  return createNotification(
    userId,
    'system',
    title,
    message
  );
};

export { app, db, auth };
