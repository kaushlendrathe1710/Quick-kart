import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@shared/types';
import { authStorage } from '@/utils/auth';

/**
 * Auth Slice - Manages authentication state for all user roles
 * Handles buyers, sellers, delivery partners, and admins
 * Persists auth data to localStorage
 */

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  requiresProfile: boolean;
  isInitialized: boolean; // Track if auth has been initialized from localStorage
}

// Initialize state from localStorage
const storedUser = authStorage.getUser();
const storedToken = authStorage.getToken();

const initialState: AuthState = {
  currentUser: storedUser,
  isAuthenticated: !!storedUser && !!storedToken,
  requiresProfile: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.requiresProfile = false;
      // Persist to localStorage
      authStorage.setUser(action.payload);
    },
    setToken: (state, action: PayloadAction<string>) => {
      // Store token in localStorage
      authStorage.setToken(action.payload);
    },
    setRequiresProfile: (state, action: PayloadAction<boolean>) => {
      state.requiresProfile = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.requiresProfile = false;
      // Clear from localStorage
      authStorage.clearAuth();
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        // Update in localStorage
        authStorage.setUser(state.currentUser);
      }
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setUser, setToken, setRequiresProfile, clearUser, updateUser, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
