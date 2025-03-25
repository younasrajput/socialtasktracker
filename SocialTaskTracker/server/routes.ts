import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';
import {
  signinSchema,
  signupSchema,
  insertTaskSchema,
  insertUserTaskSchema
} from '@shared/schema';
import { fromZodError } from 'zod-validation-error';

// Fix type for MemoryStore session
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'socialtaskhub-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Sanitize user data (remove password)
  const sanitizeUser = (user: any) => {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  };

  // Helper function to handle zod validation
  const validateSchema = <T>(schema: z.ZodSchema<T>, data: any): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw fromZodError(error);
      }
      throw error;
    }
  };

  // Auth routes
  app.post('/api/auth/signin', (req, res, next) => {
    try {
      // Validate input
      validateSchema(signinSchema, req.body);
      
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json({ user: sanitizeUser(user) });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  });

  app.post('/api/auth/signup', async (req, res, next) => {
    try {
      // Validate input
      const userData = validateSchema(signupSchema, req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Create user
      const { passwordConfirm, referralCode, ...userDataToInsert } = userData;
      
      const user = await storage.createUser(userDataToInsert, referralCode);
      
      // Log in the new user
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(201).json({ user: sanitizeUser(user) });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  });

  app.get('/api/auth/user', isAuthenticated, (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
  });

  app.post('/api/auth/signout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Packages routes
  app.get('/api/packages', async (_req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching packages' });
    }
  });

  app.get('/api/packages/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.getPackage(id);
      
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching package' });
    }
  });

  // User packages routes
  app.get('/api/user/packages', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userPackages = await storage.getUserPackages(userId);
      
      // Get full package details
      const packagesWithDetails = await Promise.all(
        userPackages.map(async (up) => {
          const pkg = await storage.getPackage(up.packageId);
          return { ...up, package: pkg };
        })
      );
      
      res.json(packagesWithDetails);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user packages' });
    }
  });

  app.post('/api/user/packages', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { packageId, paymentMethod, transactionId } = req.body;
      
      // Validate input
      if (!packageId || !paymentMethod || !transactionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Get package details
      const pkg = await storage.getPackage(parseInt(packageId));
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      // Create payment record
      const payment = await storage.createPayment({
        userId,
        packageId: pkg.id,
        amount: pkg.price,
        status: 'success', // In a real app, this would be determined by payment provider
        paymentMethod,
        transactionId
      });
      
      // Calculate subscription end date (1 month from now)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      // Create user package
      const userPackage = await storage.createUserPackage({
        userId,
        packageId: pkg.id,
        startDate: new Date(),
        endDate,
        isActive: true
      });
      
      res.status(201).json({ userPackage, payment });
    } catch (error) {
      res.status(500).json({ message: 'Error purchasing package' });
    }
  });

  // Tasks routes
  app.get('/api/tasks', async (_req, res) => {
    try {
      const tasks = await storage.getActiveTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching tasks' });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching task' });
    }
  });

  // User tasks routes
  app.get('/api/user/tasks', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userTasks = await storage.getUserTasks(userId);
      res.json(userTasks);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user tasks' });
    }
  });

  app.get('/api/user/tasks/stats', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getUserTaskStats(userId);
      
      // Also get referral stats
      const referrals = await storage.getUserReferrals(userId);
      const referralEarnings = await storage.getTotalReferralEarnings(userId);
      
      res.json({
        ...stats,
        referrals: referrals.length,
        referralEarnings
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user task stats' });
    }
  });

  app.post('/api/user/tasks', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { taskId } = req.body;
      
      // Validate input
      if (!taskId) {
        return res.status(400).json({ message: 'Missing taskId' });
      }
      
      // Check if task exists
      const task = await storage.getTask(parseInt(taskId));
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      // Check if user already has this task
      const userTasks = await storage.getUserTasks(userId);
      const existingTask = userTasks.find(ut => ut.taskId === parseInt(taskId));
      
      if (existingTask) {
        return res.status(400).json({ message: 'You have already claimed this task' });
      }
      
      // Create user task
      const userTask = await storage.createUserTask({
        userId,
        taskId: parseInt(taskId),
        status: 'active'
      });
      
      res.status(201).json({ ...userTask, task });
    } catch (error) {
      res.status(500).json({ message: 'Error claiming task' });
    }
  });

  app.post('/api/user/tasks/:id/complete', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const id = parseInt(req.params.id);
      const { proofUrl } = req.body;
      
      // Check if user task exists and belongs to the user
      const userTasks = await storage.getUserTasks(userId);
      const userTask = userTasks.find(ut => ut.id === id);
      
      if (!userTask) {
        return res.status(404).json({ message: 'Task not found or does not belong to you' });
      }
      
      if (userTask.status === 'completed') {
        return res.status(400).json({ message: 'Task already completed' });
      }
      
      // Mark task as completed
      const completedTask = await storage.markTaskAsCompleted(id, proofUrl);
      
      res.json({ ...completedTask, task: userTask.task });
    } catch (error) {
      res.status(500).json({ message: 'Error completing task' });
    }
  });

  // Referral routes
  app.get('/api/user/referrals', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const referrals = await storage.getUserReferrals(userId);
      const referralEarnings = await storage.getUserReferralEarnings(userId);
      
      // Sanitize referred users
      const sanitizedReferrals = referrals.map(sanitizeUser);
      
      res.json({
        referrals: sanitizedReferrals,
        earnings: referralEarnings,
        totalEarnings: referralEarnings.reduce((sum, earning) => sum + earning.amount, 0)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching referrals' });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
