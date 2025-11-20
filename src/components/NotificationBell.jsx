import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function NotificationBell({ onNavigate, showDropdown, setShowDropdown }) {
  const { user } = useAuth();
  const [internalShowDropdown, setInternalShowDropdown] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = showDropdown !== undefined ? showDropdown : internalShowDropdown;
  const setIsOpen = setShowDropdown || setInternalShowDropdown;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Load notifications from database
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to new notifications
    const getUserIdAndSubscribe = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!userData) return;

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userData.id}`
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    getUserIdAndSubscribe();
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Delete notification after 3 seconds
      setTimeout(async () => {
        try {
          const { error: deleteError } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

          if (deleteError) throw deleteError;

          // Remove from local state
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
          console.error('Error deleting notification:', err);
        }
      }, 3000);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!userData) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userData.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate based on notification type, link, or title content
    if (onNavigate) {
      // Check notification type first
      if (notification.type === 'new_message') {
        onNavigate('messages', null);
      } else if (notification.type === 'new_match' || notification.type === 'mutual_connection' || notification.type === 'connection_request') {
        // Extract user ID from action_url if present (format: /connections?userId=UUID)
        let userId = null;
        const urlToCheck = notification.action_url || notification.link;
        if (urlToCheck && urlToCheck.includes('?userId=')) {
          userId = urlToCheck.split('?userId=')[1];
        } else if (urlToCheck && urlToCheck.includes('?user=')) {
          userId = urlToCheck.split('?user=')[1];
        }
        onNavigate('connections', userId);
      } else if (notification.link) {
        // Fallback to link if provided
        if (notification.link.includes('/messages')) {
          onNavigate('messages', null);
        } else if (notification.link.includes('/connections')) {
          // Extract user ID if present
          let userId = null;
          if (notification.link.includes('?user=')) {
            userId = notification.link.split('?user=')[1];
          }
          onNavigate('connections', userId);
        }
      } else if (notification.title) {
        // Fallback: check title content for keywords
        const titleLower = notification.title.toLowerCase();
        if (titleLower.includes('message')) {
          onNavigate('messages', null);
        } else if (titleLower.includes('connection') || titleLower.includes('connect')) {
          onNavigate('connections', null);
        }
      }
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get notification icon based on type (all use bell icon)
  const getNotificationIcon = (type) => {
    return '🔔';
  };

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-600 hover:text-gray-900 p-2 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[240px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#009900] hover:text-[#007700] font-medium"
              >
                Mark all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-xs mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-medium">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-2 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-semibold text-gray-900 line-clamp-1 ${!notification.is_read ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatTimestamp(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notification.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
                            aria-label="Delete notification"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                        {!notification.is_read && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
