import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BalanceHistoryItem } from '@/types';

type BalanceHistoryChartProps = {
  data: BalanceHistoryItem[];
};

const BalanceHistoryChart = ({ data }: BalanceHistoryChartProps) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter(item => new Date(item.date) >= cutoff);
  };

  const filteredData = getFilteredData();

  // Calculate totals
  const totalTasks = filteredData
    .filter(item => item.source === 'tasks')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalReferrals = filteredData
    .filter(item => item.source === 'referrals')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalBonus = filteredData
    .filter(item => item.source === 'bonus')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalEarnings = totalTasks + totalReferrals + totalBonus;

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${(value / 100).toFixed(2)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Earnings History</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant={timeRange === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Tasks</p>
            <p className="text-xl font-semibold">{formatCurrency(totalTasks)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Referrals</p>
            <p className="text-xl font-semibold">{formatCurrency(totalReferrals)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Bonus</p>
            <p className="text-xl font-semibold">{formatCurrency(totalBonus)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-500">Total</p>
            <p className="text-xl font-semibold text-blue-600">{formatCurrency(totalEarnings)}</p>
          </div>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 100).toFixed(0)}`} 
              />
              <Tooltip 
                formatter={(value, name) => [`$${(Number(value) / 100).toFixed(2)}`, name]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={(data) => data.source === 'tasks' ? data.amount : 0}
                name="Tasks"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey={(data) => data.source === 'referrals' ? data.amount : 0}
                name="Referrals"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey={(data) => data.source === 'bonus' ? data.amount : 0}
                name="Bonus"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceHistoryChart;