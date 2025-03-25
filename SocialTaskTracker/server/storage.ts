import { 
  users, 
  packages, 
  userPackages,
  tasks,
  userTasks,
  payments,
  referralEarnings,
  type User, 
  type InsertUser,
  type Package,
  type InsertPackage,
  type UserPackage,
  type InsertUserPackage,
  type Task,
  type InsertTask,
  type UserTask,
  type InsertUserTask,
  type Payment,
  type InsertPayment,
  type ReferralEarning,
  type InsertReferralEarning
} from "@shared/schema";
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser, referralCode?: string): Promise<User>;
  
  // Package operations
  getPackage(id: number): Promise<Package | undefined>;
  getAllPackages(): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  
  // User Package operations
  getUserPackages(userId: number): Promise<UserPackage[]>;
  createUserPackage(userPackage: InsertUserPackage): Promise<UserPackage>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getActiveTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  
  // User Task operations
  getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]>;
  getUserTaskStats(userId: number): Promise<{ completed: number; active: number; totalEarnings: number }>;
  createUserTask(userTask: InsertUserTask): Promise<UserTask>;
  markTaskAsCompleted(id: number, proofUrl?: string): Promise<UserTask>;
  
  // Payment operations
  getUserPayments(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Referral operations
  getUserReferrals(userId: number): Promise<User[]>;
  getUserReferralEarnings(userId: number): Promise<ReferralEarning[]>;
  createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning>;
  getTotalReferralEarnings(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private packages: Map<number, Package>;
  private userPackages: Map<number, UserPackage>;
  private tasks: Map<number, Task>;
  private userTasks: Map<number, UserTask>;
  private payments: Map<number, Payment>;
  private referralEarnings: Map<number, ReferralEarning>;
  
  private userIdCounter: number = 1;
  private packageIdCounter: number = 1;
  private userPackageIdCounter: number = 1;
  private taskIdCounter: number = 1;
  private userTaskIdCounter: number = 1;
  private paymentIdCounter: number = 1;
  private referralEarningIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.packages = new Map();
    this.userPackages = new Map();
    this.tasks = new Map();
    this.userTasks = new Map();
    this.payments = new Map();
    this.referralEarnings = new Map();
    
    // Initialize with default packages
    this.initializeDefaultPackages();
    // Initialize with default tasks
    this.initializeDefaultTasks();
  }

  private initializeDefaultPackages() {
    this.createPackage({
      name: "Starter",
      type: "starter",
      description: "Perfect for beginners looking to grow their social presence.",
      price: 2900, // $29.00
      tasksPerMonth: 30,
      features: ["30 social tasks per month", "Basic analytics", "Email support"],
      isPopular: false
    });
    
    this.createPackage({
      name: "Professional",
      type: "professional",
      description: "Great for active social media influencers and content creators.",
      price: 7900, // $79.00
      tasksPerMonth: 100,
      features: ["100 social tasks per month", "Advanced analytics", "Priority support", "Exclusive campaigns"],
      isPopular: true
    });
    
    this.createPackage({
      name: "Enterprise",
      type: "enterprise",
      description: "For businesses and agencies managing multiple accounts.",
      price: 19900, // $199.00
      tasksPerMonth: 1000, // Effectively unlimited
      features: ["Unlimited social tasks", "Enterprise analytics dashboard", "Dedicated account manager", "API access"],
      isPopular: false
    });
  }

  private initializeDefaultTasks() {
    // Facebook tasks
    this.createTask({
      title: "Like and comment on Business Post",
      description: "Visit the provided link, like the post and leave a thoughtful comment about the content.",
      platform: "facebook",
      reward: 200, // $2.00
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    });
    
    // Instagram tasks
    this.createTask({
      title: "Follow account and like recent posts",
      description: "Follow the account and like their 3 most recent posts. Screenshot proof required.",
      platform: "instagram",
      reward: 350, // $3.50
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
    });
    
    // Twitter tasks
    this.createTask({
      title: "Retweet and add comment",
      description: "Retweet the provided tweet and add your own comment or thoughts about it.",
      platform: "twitter",
      reward: 275, // $2.75
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });
    
    // LinkedIn tasks
    this.createTask({
      title: "Share article on LinkedIn",
      description: "Share the provided article on your LinkedIn profile with a professional comment.",
      platform: "linkedin",
      reward: 400, // $4.00
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.referralCode === referralCode);
  }

  async createUser(user: InsertUser, referrerCode?: string): Promise<User> {
    const id = this.userIdCounter++;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    
    let referredBy: number | null = null;
    
    if (referrerCode) {
      const referrer = await this.getUserByReferralCode(referrerCode);
      if (referrer) {
        referredBy = referrer.id;
      }
    }
    
    const referralCode = nanoid(8);
    const createdUser: User = { 
      ...user, 
      id, 
      password: hashedPassword,
      referralCode,
      referredBy: referredBy || null,
      createdAt: new Date() 
    };
    
    this.users.set(id, createdUser);
    
    // If there's a referrer, create a referral earning record
    if (referredBy) {
      // For now, let's say referral bonus is 10% of the starter package
      const starterPackage = Array.from(this.packages.values()).find(pkg => pkg.type === 'starter');
      if (starterPackage) {
        const referralAmount = Math.round(starterPackage.price * 0.1); // 10% of package price
        await this.createReferralEarning({
          referrerId: referredBy,
          referredUserId: id,
          amount: referralAmount
        });
      }
    }
    
    return createdUser;
  }

  // Package operations
  async getPackage(id: number): Promise<Package | undefined> {
    return this.packages.get(id);
  }

  async getAllPackages(): Promise<Package[]> {
    return Array.from(this.packages.values());
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const id = this.packageIdCounter++;
    const newPackage: Package = { ...pkg, id };
    this.packages.set(id, newPackage);
    return newPackage;
  }

  // User Package operations
  async getUserPackages(userId: number): Promise<UserPackage[]> {
    return Array.from(this.userPackages.values()).filter(up => up.userId === userId);
  }

  async createUserPackage(userPackage: InsertUserPackage): Promise<UserPackage> {
    const id = this.userPackageIdCounter++;
    const newUserPackage: UserPackage = { ...userPackage, id };
    this.userPackages.set(id, newUserPackage);
    return newUserPackage;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getActiveTasks(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(task => task.expiresAt > now);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id, createdAt: new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }

  // User Task operations
  async getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    const userTasks = Array.from(this.userTasks.values())
      .filter(ut => ut.userId === userId);
    
    return userTasks.map(ut => {
      const task = this.tasks.get(ut.taskId)!;
      return { ...ut, task };
    });
  }

  async getUserTaskStats(userId: number): Promise<{ completed: number; active: number; totalEarnings: number }> {
    const userTasks = await this.getUserTasks(userId);
    
    const completed = userTasks.filter(ut => ut.status === 'completed').length;
    const active = userTasks.filter(ut => ut.status === 'active').length;
    
    // Calculate total earnings from completed tasks
    const totalEarnings = userTasks
      .filter(ut => ut.status === 'completed')
      .reduce((sum, ut) => sum + ut.task.reward, 0);
    
    return { completed, active, totalEarnings };
  }

  async createUserTask(userTask: InsertUserTask): Promise<UserTask> {
    const id = this.userTaskIdCounter++;
    const newUserTask: UserTask = { ...userTask, id, completedAt: null };
    this.userTasks.set(id, newUserTask);
    return newUserTask;
  }

  async markTaskAsCompleted(id: number, proofUrl?: string): Promise<UserTask> {
    const userTask = this.userTasks.get(id);
    if (!userTask) {
      throw new Error(`User task with ID ${id} not found`);
    }
    
    const updatedUserTask: UserTask = {
      ...userTask,
      status: 'completed',
      completedAt: new Date(),
      proofUrl: proofUrl || userTask.proofUrl
    };
    
    this.userTasks.set(id, updatedUserTask);
    return updatedUserTask;
  }

  // Payment operations
  async getUserPayments(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const newPayment: Payment = { ...payment, id, createdAt: new Date() };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  // Referral operations
  async getUserReferrals(userId: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.referredBy === userId);
  }

  async getUserReferralEarnings(userId: number): Promise<ReferralEarning[]> {
    return Array.from(this.referralEarnings.values())
      .filter(earning => earning.referrerId === userId);
  }

  async createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning> {
    const id = this.referralEarningIdCounter++;
    const newReferralEarning: ReferralEarning = { ...earning, id, createdAt: new Date() };
    this.referralEarnings.set(id, newReferralEarning);
    return newReferralEarning;
  }

  async getTotalReferralEarnings(userId: number): Promise<number> {
    const earnings = await this.getUserReferralEarnings(userId);
    return earnings.reduce((sum, earning) => sum + earning.amount, 0);
  }
}

export const storage = new MemStorage();
