/**
 * Firebase Admin SDK initialization and utility functions for Cloudflare Workers
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { nanoid } from 'nanoid';

let firebaseApp;

/**
 * Initialize Firebase Admin SDK
 * @param {Object} env - Cloudflare Worker environment with Firebase secrets
 * @returns Firebase Admin App instance
 */
export function initializeFirebase(env) {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Create a service account from environment variables
  const serviceAccount = {
    type: 'service_account',
    project_id: env.FIREBASE_PROJECT_ID || '',
    private_key_id: env.FIREBASE_PRIVATE_KEY_ID || '',
    private_key: (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: env.FIREBASE_CLIENT_EMAIL || '',
    client_id: env.FIREBASE_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: env.FIREBASE_CLIENT_CERT_URL || '',
  };

  // Initialize the app with a service account, granting admin privileges
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    storageBucket: `${env.FIREBASE_PROJECT_ID}.appspot.com`,
  });

  return firebaseApp;
}

/**
 * Get Firestore database instance
 * @returns Firestore database
 */
export function getFirestore() {
  return getFirestore();
}

/**
 * Get Firebase Auth instance
 * @returns Firebase Auth
 */
export function getAuth() {
  return getAuth();
}

/**
 * Create a new user in Firebase Authentication
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data
 * @returns Created user record
 */
export async function createUser(email, password, userData = {}) {
  try {
    const auth = getAuth();
    
    // Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: userData.fullName || '',
      disabled: false,
    });
    
    // Generate a unique referral code
    const referralCode = nanoid(8).toUpperCase();
    
    // Prepare user data for Firestore
    const userDocData = {
      uid: userRecord.uid,
      email: userRecord.email,
      fullName: userData.fullName || '',
      username: userData.username || '',
      phone: userData.phone || '',
      country: userData.country || '',
      referralCode,
      referredBy: userData.referralCode || null,
      isApproved: false,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    
    // Store user data in Firestore
    const db = getFirestore();
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set(userDocData);
    
    // Create a referral record if the user was referred
    if (userData.referralCode) {
      // Find the referrer by their referral code
      const referrersQuery = await db.collection('users')
        .where('referralCode', '==', userData.referralCode)
        .limit(1)
        .get();
      
      if (!referrersQuery.empty) {
        const referrer = referrersQuery.docs[0];
        
        // Update the referredBy field
        await userRef.update({
          referredBy: referrer.id,
        });
        
        // Create a referral record
        await db.collection('referrals').add({
          referrerId: referrer.id,
          referredUserId: userRecord.uid,
          createdAt: new Date().toISOString(),
          isCompleted: false,
        });
      }
    }
    
    return { userRecord, userData: userDocData };
  } catch (error) {
    console.error('Error creating new user:', error);
    throw error;
  }
}

/**
 * Verify a Firebase ID token
 * @param {string} idToken - Firebase ID token to verify
 * @returns Decoded token claims
 */
export async function verifyIdToken(idToken) {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns User data from Firestore
 */
export async function getUserData(uid) {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

/**
 * Update user approval status
 * @param {string} uid - User ID to update
 * @param {boolean} isApproved - Whether the user is approved
 * @returns Updated user data
 */
export async function updateUserApproval(uid, isApproved) {
  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    
    await userRef.update({
      isApproved,
      updatedAt: new Date().toISOString(),
    });
    
    const updatedUserDoc = await userRef.get();
    return updatedUserDoc.data();
  } catch (error) {
    console.error('Error updating user approval:', error);
    throw error;
  }
}

/**
 * Check if a user has admin role
 * @param {string} uid - User ID to check
 * @returns {Promise<boolean>} True if user has admin role
 */
export async function isAdmin(uid) {
  try {
    const userData = await getUserData(uid);
    return userData && userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}