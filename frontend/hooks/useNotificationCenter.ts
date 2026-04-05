

import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { Notification, AdminSection } from '../types';

export const useNotificationCenter = () => {
    const [notifications, setNotifications] = useLocalStorage<Notification[]>('ezooze_admin_notifications', []);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        setHasUnread(notifications.some(n => !n.isRead));
    }, [notifications]);

    const addNotification = useCallback((
        type: Notification['type'],
        message: string,
        link: { section: AdminSection }
    ) => {
        const newNotification: Notification = {
            id: new Date().toISOString() + Math.random(),
            type,
            message,
            link,
            isRead: false,
            timestamp: new Date().toISOString(),
        };
        // Add notification and keep a max of 20
        setNotifications(prev => [newNotification, ...prev].slice(0, 20));
    }, [setNotifications]);

    const markAllAsRead = useCallback(() => {
        if (notifications.some(n => !n.isRead)) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    // FIX: Added `notifications` to the dependency array. The function's logic depends on `notifications` to check for unread items, so it should be a dependency to avoid stale closures.
    }, [notifications, setNotifications]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, [setNotifications]);

    return { notifications, hasUnread, addNotification, markAllAsRead, clearNotifications };
};