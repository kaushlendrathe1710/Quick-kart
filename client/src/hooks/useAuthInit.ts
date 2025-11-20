import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, clearUser, setInitialized } from '@/store/slices/authSlice';
import { authStorage } from '@/utils/auth';
import { authApi } from '@/api/buyer';

/**
 * useAuthInit Hook - Initialize authentication on app load
 *
 * This hook:
 * 1. Checks if user data exists in localStorage
 * 2. Validates the token by calling /api/auth/me
 * 3. If valid, keeps the user logged in
 * 4. If invalid (401), clears auth data and requires re-login
 *
 * Works for all user roles: buyer, seller, admin, delivery_partner
 */
export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip if already initialized
      if (isInitialized) return;

      // Check for stored auth
      const storedUser = authStorage.getUser();
      const storedToken = authStorage.getToken();

      if (!storedUser || !storedToken) {
        // No stored auth, mark as initialized and continue
        dispatch(setInitialized(true));
        return;
      }

      try {
        // Validate token by fetching current user from /api/auth/me
        const user = await authApi.getCurrentUser();

        // Token is valid, update Redux state with fresh user data
        dispatch(setUser(user));
        dispatch(setInitialized(true));

        console.log(`✅ Auth restored for ${user.role}:`, user.email);
      } catch (error: any) {
        // Token is invalid or expired
        console.warn('⚠️ Token validation failed:', error);

        // Clear invalid auth data
        dispatch(clearUser());
        dispatch(setInitialized(true));

        console.log('🔄 Cleared invalid auth data, user needs to login again');
      }
    };

    initializeAuth();
  }, [dispatch, isInitialized]);

  return { isInitialized };
};
