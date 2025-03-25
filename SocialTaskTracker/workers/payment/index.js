/**
 * Cloudflare Worker for SocialTask Hub Payment API
 */
import { Router } from 'itty-router';
import { withCors } from 'itty-cors';
import { initializeFirebase, getFirestore } from '../auth/firebase';
import { authenticateRequest } from '../auth/utils';
import { jsonResponse, errorResponse } from '../auth/utils';

// Create a new router
const router = Router();

// CORS handler
const corsHandler = withCors({
  origins: ['*'],
  methods: ['GET', 'POST', 'OPTIONS'],
  maxAge: 86400,
});

/**
 * Initialize Firebase with service account credentials
 * @param {Object} env - Environment variables
 */
function setupFirebase(env) {
  initializeFirebase(env);
}

/**
 * Route: /api/get-bank-details
 * Method: GET
 * Description: Get bank/crypto payment details based on user's country
 */
router.get('/api/get-bank-details', async (request, env) => {
  try {
    // Authenticate the request
    const authError = await authenticateRequest(request);
    if (authError) return authError;
    
    // Get the user's country from query parameter or from user data
    const { country } = request.query || {};
    
    if (!country) {
      return errorResponse('Country is required', 400);
    }
    
    // Initialize Firestore and get a reference to the payment config collection
    const db = getFirestore();
    const paymentConfigRef = db.collection('payment-config').doc(country.toLowerCase());
    
    // Get the payment config document
    const paymentConfigDoc = await paymentConfigRef.get();
    
    if (!paymentConfigDoc.exists) {
      return errorResponse(`Payment details not available for ${country}`, 404);
    }
    
    // Return the payment config data
    const paymentConfig = paymentConfigDoc.data();
    
    return jsonResponse({
      message: 'Payment details retrieved successfully',
      paymentDetails: paymentConfig
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return errorResponse('Failed to retrieve payment details', 500);
  }
});

/**
 * Catch-all route for 404 Not Found
 */
router.all('*', () => {
  return errorResponse('Not Found', 404);
});

/**
 * Handle incoming requests
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @param {Object} ctx - Execution context
 */
export default {
  async fetch(request, env, ctx) {
    // Setup Firebase with the service account credentials
    setupFirebase(env);
    
    // Apply CORS handler to the router
    return router.handle(corsHandler(request), env, ctx).catch(err => {
      console.error('Unhandled error:', err);
      return errorResponse('Internal Server Error', 500);
    });
  }
};