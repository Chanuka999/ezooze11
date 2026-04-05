import { useState, useCallback } from 'react';
import { NotificationContent, NotificationType } from '../components/Notification';

export const useNotification = () => {
    const [notifications, setNotifications] = useState<NotificationContent[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return { notifications, addNotification, removeNotification };
};
