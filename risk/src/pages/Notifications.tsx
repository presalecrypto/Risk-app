import React from 'react';
import { Bell, Check, Trash2, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, getUnreadNotifications } = useStore();

  const unreadCount = getUnreadNotifications().length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'end_of_day': return <Bell className="w-5 h-5" />;
      case 'end_of_week': return <Bell className="w-5 h-5" />;
      case 'risk_alert': return <AlertTriangle className="w-5 h-5 text-danger-500" />;
      case 'target_reached': return <Target className="w-5 h-5 text-success-500" />;
      case 'performance': return <TrendingUp className="w-5 h-5 text-primary-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            الإشعارات
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount} إشعار غير مقروء
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllNotificationsRead}
                icon={<Check className="w-4 h-4" />}
              >
                تحديد الكل كمقروء
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                icon={<Trash2 className="w-4 h-4" />}
              >
                حذف الكل
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card padding="none">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                  !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
                onClick={() => markNotificationRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">لا توجد إشعارات</p>
            <p className="text-sm mt-1">ستظهر الإشعارات هنا عند توفرها</p>
          </div>
        )}
      </Card>
    </div>
  );
};
