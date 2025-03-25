/**
 * Cloudflare Worker for SocialTask Hub Authentication API
 */
import { Router } from 'itty-router';
import { cors } from 'itty-cors';
import { 
  initializeFirebase,
  createUser,
  getUserData,
  updateUserApproval,
  isAdmin
} from './firebase';
import { 
  jsonResponse, 
  errorResponse, 
  authenticateRequest, 
  authenticateAdmin,
  parseJSONBody,
  validateRequiredFields
} from './utils';

// Create a new router
const router = Router();

// Add CORS middleware
const corsHandler = cors({
  origins: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400,
  credentials: true,
});
router.all('*', corsHandler);

/**
 * Initialize Firebase with service account credentials
 * @param {Object} env - Environment variables
 */
function setupFirebase(env) {
  try {
    return initializeFirebase(env);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

/**
 * Route: /api/auth/signup
 * Method: POST
 * Description: Register a new user
 */
router.post('/api/auth/signup', async (request, env) => {
  try {
    setupFirebase(env);
    
    // Parse request body
    const body = await parseJSONBody(request);
    
    // Validate required fields
    const requiredFields = ['email', 'fullName', 'username', 'phone', 'country'];
    const validationError = validateRequiredFields(body, requiredFields);
    if (validationError) {
      return errorResponse(validationError.error, validationError.status);
    }

    // The password might come from Firebase Auth when using Google Sign-In
    // In that case, we'll create a user without a password
    const userData = {
      fullName: body.fullName,
      username: body.username,
      phone: body.phone,
      country: body.country,
      referralCode: body.referralCode || null,
    };

    let result;
    
    // If the request has an Authorization header, the user was already created in Firebase Auth
    // (e.g., via Google Sign-In)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Authenticate the request to get the user
      const authError = await authenticateRequest(request);
      if (authError) {
        return authError;
      }
      
      // Create entry in Firestore without creating a new Auth user
      const { uid, email } = request.user;
      result = await createUser(email, null, { ...userData, uid });
    } else {
      // Check if password is provided
      if (!body.password) {
        return errorResponse('Password is required', 400);
      }
      
      // Create a new user in Firebase Auth and Firestore
      result = await createUser(body.email, body.password, userData);
    }
    
    return jsonResponse({
      message: 'User created successfully',
      user: {
        uid: result.userRecord.uid,
        email: result.userRecord.email,
        fullName: result.userData.fullName,
        username: result.userData.username,
        referralCode: result.userData.referralCode,
        isApproved: result.userData.isApproved
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(error.message || 'Failed to create user', 500);
  }
});

/**
 * Route: /api/auth/login
 * Method: POST
 * Description: Authenticate a user and generate a token
 * Note: Not needed as authentication happens in Firebase directly
 */
router.post('/api/auth/login', async (request, env) => {
  // Firebase Auth handles this directly, but we can add extra validation
  try {
    setupFirebase(env);
    
    // We need to authenticate the request using the token provided by Firebase Auth
    const authError = await authenticateRequest(request);
    if (authError) {
      return authError;
    }
    
    // Extract token from Authorization header
    const idToken = request.headers.get('Authorization').split('Bearer ')[1];
    
    // Return user data
    return jsonResponse({
      message: 'Login successful',
      token: idToken,
      user: {
        uid: request.user.uid,
        email: request.user.email,
        fullName: request.user.fullName,
        username: request.user.username,
        referralCode: request.user.referralCode,
        isApproved: request.user.isApproved,
        role: request.user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Authentication failed', 401);
  }
});

/**
 * Route: /api/auth/user
 * Method: GET
 * Description: Get authenticated user data
 */
router.get('/api/auth/user', async (request, env) => {
  try {
    setupFirebase(env);
    
    // Authenticate the request
    const authError = await authenticateRequest(request);
    if (authError) {
      return authError;
    }
    
    // Return user data
    return jsonResponse({
      user: {
        uid: request.user.uid,
        email: request.user.email,
        fullName: request.user.fullName,
        username: request.user.username,
        referralCode: request.user.referralCode,
        isApproved: request.user.isApproved,
        role: request.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(error.message || 'Failed to get user data', 500);
  }
});

/**
 * Route: /api/auth/approve-user
 * Method: POST
 * Description: Approve a user (admin only)
 */
router.post('/api/auth/approve-user', async (request, env) => {
  try {
    setupFirebase(env);
    
    // Authenticate the request as admin
    const authError = await authenticateAdmin(request);
    if (authError) {
      return authError;
    }
    
    // Parse request body
    const body = await parseJSONBody(request);
    
    // Validate required fields
    if (!body.uid) {
      return errorResponse('User ID is required', 400);
    }
    
    // Update user approval status
    const updatedUser = await updateUserApproval(body.uid, true);
    
    return jsonResponse({
      message: 'User approved successfully',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        isApproved: updatedUser.isApproved
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    return errorResponse(error.message || 'Failed to approve user', 500);
  }
});

/**
 * Route: /api/auth/disapprove-user
 * Method: POST
 * Description: Disapprove a user (admin only)
 */
router.post('/api/auth/disapprove-user', async (request, env) => {
  try {
    setupFirebase(env);
    
    // Authenticate the request as admin
    const authError = await authenticateAdmin(request);
    if (authError) {
      return authError;
    }
    
    // Parse request body
    const body = await parseJSONBody(request);
    
    // Validate required fields
    if (!body.uid) {
      return errorResponse('User ID is required', 400);
    }
    
    // Update user approval status
    const updatedUser = await updateUserApproval(body.uid, false);
    
    return jsonResponse({
      message: 'User disapproved successfully',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        isApproved: updatedUser.isApproved
      }
    });
  } catch (error) {
    console.error('Disapprove user error:', error);
    return errorResponse(error.message || 'Failed to disapprove user', 500);
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
    try {
      return await router.handle(request, env, ctx);
    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('Internal Server Error', 500);
    }
  }
};