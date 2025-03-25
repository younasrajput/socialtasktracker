import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/types';

interface EarningsSummaryProps {
  onWithdrawClick: () => void;
}

const EarningsSummary = ({ onWithdrawClick }: EarningsSummaryProps) => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/user/tasks/stats'],
  });
  
  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };
  
  // Get current month as string
  const getCurrentMonth = (): string => {
    return new Date().toLocaleString('default', { month: 'long' });
  };
  
  if (statsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Earnings Summary</CardTitle>
          <CardDescription>Your earnings overview</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const totalEarnings = stats?.totalEarnings || 0;
  const monthlyEarnings = stats?.monthlyEarnings || 0;
  const pendingWithdrawals = stats?.pendingWithdrawals || 0;
  const availableBalance = totalEarnings - pendingWithdrawals;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Earnings Summary</CardTitle>
        <CardDescription>Your earnings overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Available Balance */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Available Balance</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {formatCurrency(availableBalance)}
                  </p>
                </div>
              </div>
              <Button 
                onClick={onWithdrawClick}
                disabled={availableBalance === 0}
              >
                Withdraw
              </Button>
            </div>
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Monthly Earnings */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                <p className="text-sm text-blue-600 font-medium">{getCurrentMonth()} Earnings</p>
              </div>
              <p className="text-xl font-semibold text-blue-700">
                {formatCurrency(monthlyEarnings)}
              </p>
            </div>
            
            {/* Total Earned */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                <p className="text-sm text-purple-600 font-medium">Total Earned</p>
              </div>
              <p className="text-xl font-semibold text-purple-700">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            
            {/* Pending Withdrawals */}
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center mb-1">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
                <p className="text-sm text-amber-600 font-medium">Pending Withdrawals</p>
              </div>
              <p className="text-xl font-semibold text-amber-700">
                {formatCurrency(pendingWithdrawals)}
              </p>
            </div>
          </div>
          
          {/* Earnings breakdown */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Earnings Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                  <span className="text-sm">Tasks</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(stats?.taskEarnings || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Referrals</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(stats?.referralEarnings || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm">Bonuses</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(stats?.bonusEarnings || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsSummary;