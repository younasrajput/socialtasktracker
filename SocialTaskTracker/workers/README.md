# SocialTask Hub Authentication API

A Cloudflare Workers API for user authentication using Firebase Authentication and Firestore.

## Features

This API provides endpoints for:

- **User Signup** (`/api/auth/signup`): Create new user accounts and store user data in Firestore
- **User Login** (`/api/auth/login`): Authenticate users with Firebase Auth
- **User Data** (`/api/auth/user`): Fetch authenticated user data 
- **User Approval** (`/api/auth/approve-user`): Admin-only endpoint to approve users after payment verification
- **User Disapproval** (`/api/auth/disapprove-user`): Admin-only endpoint to disapprove users

## Setup & Deployment

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers
- Firebase project with Authentication and Firestore enabled

### Configuration

1. Update the `wrangler.toml` file with your Firebase project details
2. Add your Firebase service account credentials as environment secrets:

```bash
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_PRIVATE_KEY_ID
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put FIREBASE_CLIENT_ID
wrangler secret put FIREBASE_CLIENT_CERT_URL
```

3. Create a KV namespace for token storage:

```bash
wrangler kv:namespace create AUTH_TOKENS
```

4. Update your `wrangler.toml` with the KV namespace IDs

### Local Development

Run the worker locally:

```bash
npm run dev
```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## API Endpoints

### POST /api/auth/signup

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "country": "United States",
  "referralCode": "OPTIONAL_REFERRAL_CODE"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "username": "johndoe",
    "referralCode": "GENERATED_REFERRAL_CODE",
    "isApproved": false
  }
}
```

### POST /api/auth/login

Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "firebase-auth-token",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "username": "johndoe",
    "isApproved": false
  }
}
```

### GET /api/auth/user

Get authenticated user data.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response:**
```json
{
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "username": "johndoe",
    "referralCode": "USER_REFERRAL_CODE",
    "isApproved": false,
    "role": "user"
  }
}
```

### POST /api/auth/approve-user (Admin Only)

Approve a user after payment verification.

**Headers:**
```
Authorization: Bearer <firebase-id-token-admin>
```

**Request:**
```json
{
  "uid": "firebase-user-id"
}
```

**Response:**
```json
{
  "message": "User approved successfully",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "username": "johndoe",
    "isApproved": true
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `400` - Bad Request (missing fields, validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Security Notes

- All authentication is handled through Firebase Authentication
- Admin-only routes are protected by role-based authorization
- CORS is configured to allow requests from approved origins
- All user passwords are securely handled by Firebase Authentication