# SocialTask Hub

A social media task platform with React frontend and Cloudflare Workers + Firebase Firestore backend.

## Project Overview

SocialTask Hub is a platform where users can sign up, purchase packages, and complete social media tasks to earn rewards. The application uses:

- **Frontend**: React.js with TailwindCSS for styling
- **Backend**: Cloudflare Workers for serverless API endpoints
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Deployment**: Replit for development and hosting

## Features

- **User Authentication**: Sign up, sign in, and Google sign-in using Firebase Authentication
- **Role-based Authorization**: Regular users and admin roles
- **Package Management**: Browse and purchase different service packages
- **Task Management**: View, accept, and complete social media tasks
- **Referral System**: Generate referral codes and earn through referrals
- **Payment Processing**: Process payments for package purchases
- **Dashboard**: User-friendly dashboard with earnings summary and task management

## Setup & Configuration

### Prerequisites

- Node.js (v14 or higher)
- Firebase Project with Authentication and Firestore enabled
- Cloudflare account for Workers deployment

### Environment Variables

Create a `.env` file with the following variables:

```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=https://api.socialtaskhub.com
```

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication with Email/Password and Google sign-in methods
3. Create a Firestore database
4. Create a Web App in your Firebase project to get the configuration values
5. Create a service account for your admin backend
6. Download the service account key and keep it secure

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser to the URL shown in the console (usually http://localhost:5000)

### Deploying Cloudflare Workers

1. Install Wrangler CLI:
   ```
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```
   wrangler login
   ```

3. Deploy the Auth Worker:
   ```
   cd workers
   wrangler deploy
   ```

4. Set up secrets for Firebase service account:
   ```
   wrangler secret put FIREBASE_PROJECT_ID
   wrangler secret put FIREBASE_PRIVATE_KEY_ID
   wrangler secret put FIREBASE_PRIVATE_KEY
   wrangler secret put FIREBASE_CLIENT_EMAIL
   wrangler secret put FIREBASE_CLIENT_ID
   wrangler secret put FIREBASE_CLIENT_CERT_URL
   ```

## Project Structure

- `/client` - React frontend application
  - `/src/components` - UI components
  - `/src/context` - React context providers
  - `/src/hooks` - Custom hooks
  - `/src/lib` - Utility functions and Firebase configuration
  - `/src/pages` - Application pages
  - `/src/types` - TypeScript type definitions
- `/server` - Express server for development
- `/shared` - Shared code between client and server
- `/workers` - Cloudflare Workers
  - `/auth` - Authentication API

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/user` - Get authenticated user data
- `POST /api/auth/approve-user` - Approve a user (admin only)
- `POST /api/auth/disapprove-user` - Disapprove a user (admin only)

## Authentication Flow

1. User signs up or signs in through the client frontend using Firebase Authentication
2. Firebase Authentication returns a JWT token
3. The client frontend includes this token in the Authorization header for API requests
4. The backend Cloudflare Worker verifies the token with Firebase Admin SDK
5. If verified, the worker retrieves the user data from Firestore and processes the request

## License

MIT