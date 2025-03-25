import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Package types available for purchase
export const packageTypeEnum = pgEnum("package_type", ["starter", "professional", "enterprise"]);

// Task packages configuration
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: packageTypeEnum("type").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  tasksPerMonth: integer("tasks_per_month").notNull(),
  features: text("features").array().notNull(),
  isPopular: boolean("is_popular").default(false),
});

// User purchased packages
export const userPackages = pgTable("user_packages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  packageId: integer("package_id").notNull().references(() => packages.id),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

// Social platforms for tasks
export const platformEnum = pgEnum("platform", ["facebook", "instagram", "twitter", "tiktok", "linkedin", "youtube"]);

// Task status enum
export const taskStatusEnum = pgEnum("task_status", ["active", "completed", "expired"]);

// Available tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  platform: platformEnum("platform").notNull(),
  reward: integer("reward").notNull(), // in cents
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User tasks
export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  status: taskStatusEnum("status").default("active").notNull(),
  completedAt: timestamp("completed_at"),
  proofUrl: text("proof_url"),
});

// Payment records
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  packageId: integer("package_id").notNull().references(() => packages.id),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull(), // success, pending, failed
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Referral earnings
export const referralEarnings = pgTable("referral_earnings", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredUserId: integer("referred_user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas for each table
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true,
  referralCode: true 
});

export const insertPackageSchema = createInsertSchema(packages).omit({ 
  id: true 
});

export const insertUserPackageSchema = createInsertSchema(userPackages).omit({ 
  id: true 
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true,
  createdAt: true 
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({ 
  id: true,
  completedAt: true 
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true,
  createdAt: true 
});

export const insertReferralEarningSchema = createInsertSchema(referralEarnings).omit({ 
  id: true,
  createdAt: true 
});

// Auth types
export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const signupSchema = insertUserSchema.extend({
  passwordConfirm: z.string().min(6, "Password confirmation must be at least 6 characters"),
  referralCode: z.string().optional()
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"]
});

// Export inferred types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type UserPackage = typeof userPackages.$inferSelect;
export type InsertUserPackage = z.infer<typeof insertUserPackageSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type ReferralEarning = typeof referralEarnings.$inferSelect;
export type InsertReferralEarning = z.infer<typeof insertReferralEarningSchema>;
export type SignInCredentials = z.infer<typeof signinSchema>;
export type SignUpData = z.infer<typeof signupSchema>;
