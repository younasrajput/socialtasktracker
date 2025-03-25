
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAdminToken, verifyUserToken } from '../auth/middleware';

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

// Create new task (Admin only)
app.post('/api/create-task', verifyAdminToken, async (c) => {
  try {
    const { title, description, platform, reward } = await c.req.json();
    
    const taskRef = await db.collection('tasks').add({
      title,
      description,
      platform,
      reward,
      createdAt: new Date(),
      status: 'active'
    });

    return c.json({ 
      message: 'Task created successfully',
      taskId: taskRef.id 
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Get available tasks (User)
app.get('/api/get-tasks', verifyUserToken, async (c) => {
  try {
    const tasksRef = db.collection('tasks')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc');
    
    const snapshot = await tasksRef.get();
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return c.json({ tasks });
  } catch (error) {
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Submit task completion (User)
app.post('/api/submit-task', verifyUserToken, async (c) => {
  try {
    const { taskId, proofUrl } = await c.req.json();
    const userId = c.get('userId');

    const submissionRef = await db.collection('taskSubmissions').add({
      taskId,
      userId,
      proofUrl,
      status: 'pending',
      submittedAt: new Date()
    });

    return c.json({ 
      message: 'Task submitted successfully',
      submissionId: submissionRef.id 
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to submit task' }, 500);
  }
});

// Approve task submission (Admin)
app.post('/api/approve-task', verifyAdminToken, async (c) => {
  try {
    const { submissionId } = await c.req.json();
    
    const submissionRef = db.collection('taskSubmissions').doc(submissionId);
    const submission = await submissionRef.get();
    
    if (!submission.exists) {
      return c.json({ error: 'Submission not found' }, 404);
    }

    const submissionData = submission.data()!;
    const taskRef = db.collection('tasks').doc(submissionData.taskId);
    const task = await taskRef.get();

    if (!task.exists) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const taskData = task.data()!;

    // Update submission status
    await submissionRef.update({
      status: 'completed',
      completedAt: new Date()
    });

    // Update user earnings
    await db.collection('users').doc(submissionData.userId).update({
      earnings: admin.firestore.FieldValue.increment(taskData.reward)
    });

    return c.json({ 
      message: 'Task approved successfully',
      reward: taskData.reward 
    });
  } catch (error) {
    return c.json({ error: 'Failed to approve task' }, 500);
  }
});

export default {
  fetch: handle(app)
};
