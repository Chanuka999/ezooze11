import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, CloseIcon } from './icons';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationContent {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationProps {
  notification: NotificationContent;
  onClose: (id: number) => void;
}

const icons = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
  error: <XCircleIcon className="h-6 w-6 text-red-400" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
};

export const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  return (
    <div className="max-w-sm w-full bg-white dark:bg-brand-surface shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fadeInUp">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[notification.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(notification.id)}
              className="bg-white dark:bg-brand-surface rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC<{
    notifications: NotificationContent[];
    onClose: (id: number) => void;
}> = ({ notifications, onClose }) => {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <Notification key={notification.id} notification={notification} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};
