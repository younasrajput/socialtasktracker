import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { NotificationType } from '@/types';

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Set up real-time listener for notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a query for this user's notifications
      const notificationsRef = collection(db, 'notifications');
      const userNotificationsQuery = query(
        notificationsRef, 
        where('userId', '==', user.id.toString()),
        orderBy('createdAt', 'desc')
      );

      // Set up the real-time listener
      const unsubscribe = onSnapshot(
        userNotificationsQuery,
        (snapshot) => {
          const notificationsList: NotificationType[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              type: data.type,
              title: data.title,
              message: data.message,
              time: data.createdAt.toDate(),
              read: data.read
            };
          });
          
          setNotifications(notificationsList);
          setLoading(false);
        },
        (err) => {
          console.error('Error listening to notifications:', err);
          setError('Failed to load notifications');
          setLoading(false);
        }
      );

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up notifications listener:', err);
      setError('Failed to set up notifications system');
      setLoading(false);
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      // Get all unread notifications
      const notificationsRef = collection(db, 'notifications');
      const unreadQuery = query(
        notificationsRef,
        where('userId', '==', user.id.toString()),
        where('read', '==', false)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      
      // Update each one as read
      const updatePromises = unreadSnapshot.docs.map(docSnapshot => {
        return updateDoc(doc(db, 'notifications', docSnapshot.id), {
          read: true
        });
      });
      
      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications');
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    error
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};