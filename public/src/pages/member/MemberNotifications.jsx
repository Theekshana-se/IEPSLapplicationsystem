import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../api/memberApi';
import { formatDate } from '../../utils/helpers';

export default function MemberNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await getNotifications();
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await markNotificationRead(notificationId);
            setNotifications((current) =>
                current.map((notification) =>
                    notification._id === notificationId
                        ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                    <p className="text-gray-600 mt-1">Renewal reminders, payment updates, and account alerts.</p>
                </div>
                <span className="badge badge-primary text-lg px-4 py-2">
                    {notifications.filter((item) => !item.isRead).length} Unread
                </span>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center py-12">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No notifications yet</p>
                        </div>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div key={notification._id} className="card">
                            <div className="card-body">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-lg ${notification.isRead ? 'bg-gray-100 text-gray-500' : 'bg-primary-100 text-primary-600'}`}>
                                            {notification.isRead ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Clock className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                                            <p className="text-gray-600 mt-1">{notification.message}</p>
                                            <p className="text-sm text-gray-500 mt-3">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {!notification.isRead && (
                                        <button
                                            type="button"
                                            className="btn btn-outline"
                                            onClick={() => markAsRead(notification._id)}
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
