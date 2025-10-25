import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Notification Service
 * Handles all notification-related API calls
 */
class NotificationService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get notifications for user
   * @param {string} userId - User ID
   * @param {object} filters - Filter parameters
   * @returns {Promise<Array>} - User notifications
   */
  async getNotifications(userId, filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.NOTIFICATIONS.BASE}/${userId}`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }

  /**
   * Get notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<object>} - Notification details
   */
  async getNotificationById(notificationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification');
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId) {
    try {
      await axios.put(
        `${this.baseURL}${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}/read`
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async markAllAsRead(userId) {
    try {
      await axios.put(
        `${this.baseURL}${API_ENDPOINTS.NOTIFICATIONS.BASE}/${userId}/read-all`
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId) {
    try {
      await axios.delete(
        `${this.baseURL}${API_ENDPOINTS.NOTIFICATIONS.BASE}/${notificationId}`
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }

  /**
   * Send notification
   * @param {object} notificationData - Notification data
   * @returns {Promise<object>} - Sent notification
   */
  async sendNotification(notificationData) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.NOTIFICATIONS.SEND}`,
        notificationData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
  }

  /**
   * Get notification preferences
   * @param {string} userId - User ID
   * @returns {Promise<object>} - Notification preferences
   */
  async getNotificationPreferences(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/notifications/preferences/${userId}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   * @param {string} userId - User ID
   * @param {object} preferences - Notification preferences
   * @returns {Promise<object>} - Updated preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await axios.put(
        `${this.baseURL}/notifications/preferences/${userId}`,
        preferences
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification preferences');
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Unread count
   */
  async getUnreadCount(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/notifications/${userId}/unread-count`
      );
      
      return response.data.count;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }

  /**
   * Subscribe to push notifications
   * @param {object} subscriptionData - Subscription data
   * @returns {Promise<object>} - Subscription result
   */
  async subscribeToPush(subscriptionData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/notifications/push/subscribe`,
        subscriptionData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to subscribe to push notifications');
    }
  }

  /**
   * Unsubscribe from push notifications
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async unsubscribeFromPush(userId) {
    try {
      await axios.delete(
        `${this.baseURL}/notifications/push/unsubscribe/${userId}`
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe from push notifications');
    }
  }

  /**
   * Get notification templates
   * @returns {Promise<Array>} - Notification templates
   */
  async getNotificationTemplates() {
    try {
      const response = await axios.get(
        `${this.baseURL}/notifications/templates`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification templates');
    }
  }

  /**
   * Create notification template
   * @param {object} templateData - Template data
   * @returns {Promise<object>} - Created template
   */
  async createNotificationTemplate(templateData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/notifications/templates`,
        templateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create notification template');
    }
  }

  /**
   * Update notification template
   * @param {string} templateId - Template ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} - Updated template
   */
  async updateNotificationTemplate(templateId, updateData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/notifications/templates/${templateId}`,
        updateData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification template');
    }
  }

  /**
   * Delete notification template
   * @param {string} templateId - Template ID
   * @returns {Promise<void>}
   */
  async deleteNotificationTemplate(templateId) {
    try {
      await axios.delete(
        `${this.baseURL}/notifications/templates/${templateId}`
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification template');
    }
  }

  /**
   * Get notification statistics
   * @param {object} filters - Filter parameters
   * @returns {Promise<object>} - Notification statistics
   */
  async getNotificationStats(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/notifications/stats`,
        { params: filters }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification statistics');
    }
  }

  /**
   * Test notification
   * @param {object} testData - Test notification data
   * @returns {Promise<object>} - Test result
   */
  async testNotification(testData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/notifications/test`,
        testData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to test notification');
    }
  }
}

export const notificationService = new NotificationService();