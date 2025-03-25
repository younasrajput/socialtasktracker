// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  referralCode: string;
  referredBy?: number | null;
  createdAt: Date;
}

// Package types
export type PackageType = 'starter' | 'professional' | 'enterprise';

export interface Package {
  id: number;
  name: string;
  type: PackageType;
  description: string;
  price: number; // in cents
  tasksPerMonth: number;
  features: string[];
  isPopular: boolean;
}

export interface UserPackage {
  id: number;
  userId: number;
  packageId: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  package?: Package;
}

// Task related types
export type Platform = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';
export type TaskStatus = 'active' | 'completed' | 'expired';

export interface Task {
  id: number;
  title: string;
  description: string;
  platform: Platform;
  reward: number; // in cents
  expiresAt: Date;
  createdAt: Date;
}

export interface UserTask {
  id: number;
  userId: number;
  taskId: number;
  status: TaskStatus;
  completedAt?: Date | null;
  proofUrl?: string | null;
  task?: Task;
}

// Payment related types
export interface Payment {
  id: number;
  userId: number;
  packageId: number;
  amount: number; // in cents
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
}

export interface PaymentDetails {
  bankAccounts?: {
    name: string;
    accountNumber: string;
    routingNumber?: string;
    bankName: string;
    swift?: string;
    iban?: string;
  }[];
  cryptoAddresses?: {
    currency: string;
    address: string;
    network?: string;
  }[];
  paypal?: {
    email: string;
  };
}

// Referral related types
export interface ReferralEarning {
  id: number;
  referrerId: number;
  referredUserId: number;
  amount: number; // in cents
  createdAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  completed: number;
  active: number;
  totalEarnings: number;
  monthlyEarnings: number; // This month's earnings
  taskEarnings: number; // Total earnings from tasks
  referrals: number;
  referralEarnings: number;
  bonusEarnings: number; // Total earnings from bonuses
  pendingWithdrawals: number; // Amount currently pending withdrawal
}

export interface BalanceHistoryItem {
  id: number;
  userId: number;
  date: string;
  amount: number;
  source: 'tasks' | 'referrals' | 'bonus' | 'withdrawal';
  description: string;
}

export interface NotificationType {
  id: string;
  type: 'alert' | 'success' | 'payment' | 'referral' | 'system';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number; // in cents
  paymentMethod: string;
  accountDetails: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
}

// Auth types
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
  referralCode?: string;
}
