import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login user
   * @param {object} credentials - Login credentials
   * @returns {Promise<object>} - Login response
   */
  async login(credentials) {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`,
        credentials
      );
      
      return {
        user: response.data.user,
        token: response.data.token,
        role: response.data.user.role
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await axios.post(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<object>} - New token
   */
  async refreshToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`
      );
      
      return {
        token: response.data.token
      };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<object>} - User profile
   */
  async getCurrentUser() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/me`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user profile
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} - Updated user profile
   */
  async updateProfile(userData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/auth/profile`,
        userData
      );
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  /**
   * Change password
   * @param {object} passwordData - Password change data
   * @returns {Promise<void>}
   */
  async changePassword(passwordData) {
    try {
      await axios.put(
        `${this.baseURL}/auth/change-password`,
        passwordData
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async requestPasswordReset(email) {
    try {
      await axios.post(
        `${this.baseURL}/auth/forgot-password`,
        { email }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   * @param {object} resetData - Password reset data
   * @returns {Promise<void>}
   */
  async resetPassword(resetData) {
    try {
      await axios.post(
        `${this.baseURL}/auth/reset-password`,
        resetData
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise<void>}
   */
  async verifyEmail(token) {
    try {
      await axios.post(
        `${this.baseURL}/auth/verify-email`,
        { token }
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Get stored token
   * @returns {string|null} - Stored token
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get stored user data
   * @returns {object|null} - Stored user data
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const authService = new AuthService();