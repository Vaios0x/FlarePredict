'use client';

import { useState } from 'react';
import { NotificationToast, type Notification } from '../components/NotificationToast';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, details?: Notification['details']) => {
    addNotification({ type: 'success', title, message, details });
  };

  const showError = (title: string, message: string, details?: Notification['details']) => {
    addNotification({ type: 'error', title, message, details });
  };

  const showWarning = (title: string, message: string, details?: Notification['details']) => {
    addNotification({ type: 'warning', title, message, details });
  };

  const showInfo = (title: string, message: string, details?: Notification['details']) => {
    addNotification({ type: 'info', title, message, details });
  };

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-[1000] space-y-4 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            notification={notification}
            onClose={removeNotification}
          />
        </div>
      ))}
    </div>
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer,
  };
}
