import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

/**
 * Notification Context Provider
 * Manages notification state and provides notification methods
 */
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  });

  useEffect(() => {
    // Load notifications if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      loadNotifications();
    }
  }, []);

  const loadNotifications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Mock notifications data
      const mockNotifications = [
        {
          id: 1,
          title: 'Appointment Confirmed',
          message: 'Your appointment for tomorrow at 2:00 PM has been confirmed.',
          type: 'appointment',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Payment Received',
          message: 'Payment of $150.00 has been successfully processed.',
          type: 'payment',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          title: 'Medical Record Updated',
          message: 'Your medical record has been updated with new test results.',
          type: 'record',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 4,
          title: 'System Maintenance',
          message: 'Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM.',
          type: 'system',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      dispatch({
        type: 'LOAD_NOTIFICATIONS_SUCCESS',
        payload: mockNotifications
      });
    } catch (error) {
      dispatch({
        type: 'LOAD_NOTIFICATIONS_ERROR',
        payload: error.message
      });
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Mock API call - no actual API call needed
      console.log('Marking notification as read:', notificationId);
      dispatch({
        type: 'MARK_AS_READ',
        payload: notificationId
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mock API call - no actual API call needed
      console.log('Marking all notifications as read');
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    });
  };

  const showToast = (message, type = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'error');
  const showWarning = (message) => showToast(message, 'warning');
  const showInfo = (message) => showToast(message, 'info');

  const value = {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Notification Reducer
 * Handles notification state updates
 */
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOAD_NOTIFICATIONS_SUCCESS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        loading: false,
        error: null
      };
    case 'LOAD_NOTIFICATIONS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    default:
      return state;
  }
};

/**
 * Custom hook to use notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};