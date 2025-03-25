/**
 * Utility functions for Cloudflare Workers authentication API
 */
import { verifyIdToken, getUserData, isAdmin } from './firebase';

/**
 * Standard JSON response helper
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns Response object
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Error response helper
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns Response object
 */
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * Authentication middleware
 * Verifies the Authorization token and attaches user data to the request
 * @param {Request} request - The original request
 * @returns {Promise<Response|null>} Error response or null if authentication succeeded
 */
export async function authenticateRequest(request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid Authorization header', 401);
    }
    
    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await verifyIdToken(idToken);
    
    // Get the user data from Firestore
    const userData = await getUserData(decodedToken.uid);
    
    // Attach the user data to the request
    request.user = userData;
    
    return null; // Authentication successful
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse('Authentication failed: ' + error.message, 401);
  }
}

/**
 * Admin authentication middleware
 * Verifies the user is authenticated and has admin role
 * @param {Request} request - The original request
 * @returns {Promise<Response|null>} Error response or null if admin authentication succeeded
 */
export async function authenticateAdmin(request) {
  // First authenticate the user
  const authError = await authenticateRequest(request);
  if (authError) {
    return authError;
  }
  
  // Check if the user is an admin
  if (!request.user || request.user.role !== 'admin') {
    return errorResponse('Admin access required', 403);
  }
  
  return null; // Admin authentication successful
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body object
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object|null} Error object or null if validation passed
 */
export function validateRequiredFields(body, requiredFields) {
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return {
      error: `Missing required fields: ${missingFields.join(', ')}`,
      status: 400,
    };
  }
  
  return null; // Validation passed
}

/**
 * Parse JSON body from request
 * @param {Request} request - The request with JSON body
 * @returns {Promise<Object>} Parsed body object
 */
export async function parseJSONBody(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}