
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyUserToken } from '../auth/middleware';

const app = new Hono();
app.use('*', cors());

// Initialize Firebase Admin
const firebaseApp = initializeApp({
  credential: {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const db = getFirestore(firebaseApp);

// Get referral stats
app.get('/api/referral/stats', verifyUserToken, async (c) => {
  try {
    const userId = c.get('userId');
    
    const referralsRef = db.collection('referrals')
      .where('referrerId', '==', userId);
    
    const snapshot = await referralsRef.get();
    const referrals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalEarnings = referrals
      .filter(ref => ref.isCompleted)
      .length * 500; // $5.00 in cents

    return c.json({ 
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(ref => ref.isCompleted).length,
      totalEarnings 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch referral stats' }, 500);
  }
});

// Handle referral completion
app.post('/api/referral/complete', verifyUserToken, async (c) => {
  try {
    const { referralId } = await c.req.json();
    
    const referralRef = db.collection('referrals').doc(referralId);
    const referral = await referralRef.get();
    
    if (!referral.exists) {
      return c.json({ error: 'Referral not found' }, 404);
    }

    const referralData = referral.data()!;
    
    if (referralData.isCompleted) {
      return c.json({ error: 'Referral already completed' }, 400);
    }

    // Update referral status
    await referralRef.update({
      isCompleted: true,
      completedAt: new Date().toISOString()
    });

    // Update referrer earnings
    await db.collection('users').doc(referralData.referrerId).update({
      earnings: admin.firestore.FieldValue.increment(500) // $5.00 in cents
    });

    // Send notification to referrer
    await sendReferralNotification(
      referralData.referrerId,
      referralData.referredUsername,
      500
    );

    return c.json({ 
      message: 'Referral completed successfully',
      bonus: 500 
    });
  } catch (error) {
    return c.json({ error: 'Failed to complete referral' }, 500);
  }
});

export default {
  fetch: handle(app)
};
