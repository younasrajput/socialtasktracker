import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle, DollarSign, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Types for notifications
type NotificationType = 'alert' | 'success' | 'payment' | 'referral' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  loading?: boolean;
}

// Helper to get icon based on notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'alert':
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'payment':
      return <DollarSign className="h-5 w-5 text-blue-500" />;
    case 'referral':
      return <Users className="h-5 w-5 text-indigo-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

// Helper to format time
const formatTime = (date: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // diff in minutes
  
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  
  return `${days}d ago`;
};

const NotificationsPanel = ({ notifications, onMarkAsRead, onMarkAllAsRead, loading = false }: NotificationsPanelProps) => {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  
  const filteredNotifications = notifications ? notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  ) : [];
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CardTitle className="text-lg font-medium">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-primary" variant="default">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'alert' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('alert')}
          >
            Alerts
          </Button>
          <Button 
            variant={filter === 'payment' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('payment')}
          >
            Payments
          </Button>
          <Button 
            variant={filter === 'referral' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('referral')}
          >
            Referrals
          </Button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-start p-3 rounded-lg animate-pulse">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex items-start p-3 rounded-lg transition ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mr-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(notification.time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto h-8 w-8 mb-2 opacity-30" />
              <p>No notifications to display</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;