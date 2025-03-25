
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAdminToken } from '../auth/middleware';

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

// Approve/reject user
app.post('/api/approve-user', verifyAdminToken, async (c) => {
  try {
    const { userId, status } = await c.req.json();
    
    const userRef = db.collection('users').doc(userId);
    const user = await userRef.get();
    
    if (!user.exists) {
      return c.json({ error: 'User not found' }, 404);
    }

    await userRef.update({
      status: status,
      updatedAt: new Date().toISOString()
    });

    return c.json({ message: `User ${status === 'approved' ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    return c.json({ error: 'Failed to update user status' }, 500);
  }
});

// Update package pricing
app.put('/api/update-package', verifyAdminToken, async (c) => {
  try {
    const { packageId, price, features } = await c.req.json();
    
    const packageRef = db.collection('packages').doc(packageId);
    const pkg = await packageRef.get();
    
    if (!pkg.exists) {
      return c.json({ error: 'Package not found' }, 404);
    }

    await packageRef.update({
      price,
      features,
      updatedAt: new Date().toISOString()
    });

    return c.json({ message: 'Package updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update package' }, 500);
  }
});

// Update payment details
app.put('/api/update-payment-details', verifyAdminToken, async (c) => {
  try {
    const { paymentId, status, notes } = await c.req.json();
    
    const paymentRef = db.collection('payments').doc(paymentId);
    const payment = await paymentRef.get();
    
    if (!payment.exists) {
      return c.json({ error: 'Payment not found' }, 404);
    }

    await paymentRef.update({
      status,
      adminNotes: notes,
      updatedAt: new Date().toISOString()
    });

    return c.json({ message: 'Payment details updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update payment details' }, 500);
  }
});

// Get referral statistics
app.get('/api/get-referral-stats', verifyAdminToken, async (c) => {
  try {
    const referralsSnapshot = await db.collection('referrals').get();
    const referrals = referralsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(ref => ref.isCompleted).length,
      totalEarnings: referrals.filter(ref => ref.isCompleted).length * 500, // $5 per referral
      topReferrers: await getTopReferrers()
    };

    return c.json(stats);
  } catch (error) {
    return c.json({ error: 'Failed to fetch referral stats' }, 500);
  }
});

// Get analytics data
app.get('/api/get-analytics', verifyAdminToken, async (c) => {
  try {
    const [users, payments, tasks] = await Promise.all([
      db.collection('users').get(),
      db.collection('payments').get(),
      db.collection('userTasks').get()
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const analytics = {
      totalUsers: users.size,
      activeUsers: users.docs.filter(doc => doc.data().lastLoginAt > thirtyDaysAgo.toISOString()).length,
      totalRevenue: payments.docs.reduce((sum, doc) => sum + doc.data().amount, 0),
      monthlyRevenue: payments.docs
        .filter(doc => new Date(doc.data().createdAt) > thirtyDaysAgo)
        .reduce((sum, doc) => sum + doc.data().amount, 0),
      completedTasks: tasks.docs.filter(doc => doc.data().status === 'completed').length
    };

    return c.json(analytics);
  } catch (error) {
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

async function getTopReferrers() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.orderBy('referralCount', 'desc').limit(10).get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    username: doc.data().username,
    referralCount: doc.data().referralCount
  }));
}

export default {
  fetch: handle(app)
};
