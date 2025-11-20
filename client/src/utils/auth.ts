import type { User } from '@shared/types';

/**
 * Auth Utilities - LocalStorage management for authentication
 */

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const authStorage = {
  /**
   * Save auth token to localStorage
   */
  setToken: (token: string): void => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save token to localStorage:', error);
    }
  },

  /**
   * Get auth token from localStorage
   */
  getToken: (): string | null => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get token from localStorage:', error);
      return null;
    }
  },

  /**
   * Remove auth token from localStorage
   */
  removeToken: (): void => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error);
    }
  },

  /**
   * Save user data to localStorage
   */
  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user from localStorage:', error);
      return null;
    }
  },

  /**
   * Remove user data from localStorage
   */
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
    }
  },

  /**
   * Clear all auth data from localStorage
   */
  clearAuth: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },

  /**
   * Check if user is authenticated (has token and user data)
   */
  isAuthenticated: (): boolean => {
    return !!authStorage.getToken() && !!authStorage.getUser();
  },
};
