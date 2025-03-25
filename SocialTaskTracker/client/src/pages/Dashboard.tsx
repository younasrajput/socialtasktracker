import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ListChecks, DollarSign, Users, BarChart4 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatCard from '@/components/dashboard/StatCard';
import TaskItem from '@/components/dashboard/TaskItem';
import ReferralSection from '@/components/dashboard/ReferralSection';
import BalanceHistoryChart from '@/components/dashboard/BalanceHistoryChart';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import WithdrawPanel from '@/components/dashboard/WithdrawPanel';
import EarningsSummary from '@/components/dashboard/EarningsSummary';
import TaskManagement from '@/components/dashboard/TaskManagement';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { DashboardStats, UserTask, Task, BalanceHistoryItem } from '@/types';

const formatReward = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Sample balance history data 
const generateSampleBalanceHistory = (): BalanceHistoryItem[] => {
  const today = new Date();
  const history: BalanceHistoryItem[] = [];
  
  // Generate last 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Tasks earnings (more frequent)
    if (i % 2 === 0) {
      history.push({
        id: history.length + 1,
        userId: 1,
        date: date.toISOString(),
        amount: Math.floor(Math.random() * 1500) + 100, // 1-15 dollars in cents
        source: 'tasks',
        description: 'Task completion reward'
      });
    }
    
    // Referral earnings (less frequent)
    if (i % 7 === 0) {
      history.push({
        id: history.length + 1,
        userId: 1,
        date: date.toISOString(),
        amount: Math.floor(Math.random() * 2000) + 500, // 5-25 dollars in cents
        source: 'referrals',
        description: 'Referral bonus'
      });
    }
    
    // Bonus (rare)
    if (i % 15 === 0) {
      history.push({
        id: history.length + 1,
        userId: 1,
        date: date.toISOString(),
        amount: 5000, // 50 dollars in cents
        source: 'bonus',
        description: 'Monthly activity bonus'
      });
    }
    
    // Withdrawals (monthly)
    if (i === 29) {
      history.push({
        id: history.length + 1,
        userId: 1,
        date: date.toISOString(),
        amount: -15000, // -150 dollars in cents (negative for withdrawals)
        source: 'withdrawal',
        description: 'Withdrawal to PayPal'
      });
    }
  }
  
  // Sort by date descending
  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Removed sample notifications function as we now use real-time notifications from Firebase

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { notifications, markAsRead, markAllAsRead, loading: notificationsLoading } = useNotifications();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [balanceHistory] = useState<BalanceHistoryItem[]>(generateSampleBalanceHistory());

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [user, authLoading, navigate]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/user/tasks/stats'],
    enabled: !!user,
  });

  // Fetch user tasks
  const { data: userTasks, isLoading: tasksLoading } = useQuery<(UserTask & { task: Task })[]>({
    queryKey: ['/api/user/tasks'],
    enabled: !!user,
  });

  // Filter active tasks
  const activeTasks = userTasks?.filter(task => task.status === 'active') || [];

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.fullName}!</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="ml-4 w-full">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <StatCard
                  title="Completed Tasks"
                  value={stats?.completed || 0}
                  icon={<ListChecks size={24} />}
                  iconColor="text-primary"
                  iconBgColor="bg-blue-100"
                />
                <StatCard
                  title="Earnings"
                  value={formatReward(stats?.totalEarnings || 0)}
                  icon={<DollarSign size={24} />}
                  iconColor="text-green-600"
                  iconBgColor="bg-green-100"
                />
                <StatCard
                  title="Referrals"
                  value={stats?.referrals || 0}
                  icon={<Users size={24} />}
                  iconColor="text-amber-500"
                  iconBgColor="bg-amber-100"
                />
                <StatCard
                  title="Active Tasks"
                  value={stats?.active || 0}
                  icon={<BarChart4 size={24} />}
                  iconColor="text-indigo-600"
                  iconBgColor="bg-indigo-100"
                />
              </>
            )}
          </div>
          
          {/* Main Dashboard Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Earnings Summary */}
                    <EarningsSummary onWithdrawClick={() => setShowWithdraw(true)} />
                    
                    {/* Active Tasks Preview */}
                    <div className="bg-white rounded-lg shadow">
                      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Active Tasks</h2>
                        <Button 
                          variant="link" 
                          onClick={() => setActiveTab('tasks')}
                          className="text-sm font-medium text-primary hover:text-blue-700"
                        >
                          View All
                        </Button>
                      </div>
                      
                      {tasksLoading ? (
                        <div className="divide-y divide-gray-200">
                          {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="px-6 py-5 animate-pulse">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                  <div className="ml-4">
                                    <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                                  <div className="ml-4 h-8 w-24 bg-gray-200 rounded"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {activeTasks.length > 0 ? (
                            activeTasks.slice(0, 3).map((userTask) => (
                              <TaskItem key={userTask.id} userTask={userTask} />
                            ))
                          ) : (
                            <div className="px-6 py-10 text-center">
                              <p className="text-gray-500 mb-4">No active tasks. Find new tasks to complete!</p>
                              <Button className="bg-primary hover:bg-blue-600 text-white">
                                Browse Available Tasks
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Balance History Chart */}
                    <BalanceHistoryChart data={balanceHistory} />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="flex flex-col gap-6">
                  {/* Withdraw Panel (Conditional) */}
                  {showWithdraw ? (
                    <WithdrawPanel 
                      availableBalance={stats?.totalEarnings || 0} 
                      onWithdraw={() => setShowWithdraw(false)}
                    />
                  ) : null}
                  
                  {/* Notifications Panel */}
                  <NotificationsPanel 
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    loading={notificationsLoading}
                  />
                  
                  {/* Referral Quick Access */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-medium mb-4">Quick Share Your Referral</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Share your referral code and earn 10% from your friends' earnings
                    </p>
                    <div className="flex space-x-2 mb-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setActiveTab('referrals')}
                      >
                        View Referrals
                      </Button>
                      <Button size="sm" className="flex-1">
                        Share Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <TaskManagement userId={user.id} />
            </TabsContent>
            
            {/* Earnings Tab */}
            <TabsContent value="earnings">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BalanceHistoryChart data={balanceHistory} />
                </div>
                <div>
                  <WithdrawPanel 
                    availableBalance={stats?.totalEarnings || 0}
                    onWithdraw={() => {}}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Referrals Tab */}
            <TabsContent value="referrals">
              <ReferralSection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
