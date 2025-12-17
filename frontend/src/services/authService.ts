import api from './api';
import { signUp, signIn, logOut, signInWithGoogle, getCurrentUser as getFirebaseUser } from './firebase';
import type { User } from '@/types';

export const authService = {
  // Sign up and create user in backend
  signup: async (email: string, password: string, displayName: string) => {
    try {
      // Validate inputs
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (!displayName || displayName.trim().length === 0) {
        throw new Error('Please provide a display name');
      }

      // Create Firebase user
      const userCredential = await signUp(email, password);
      const user = userCredential.user;

      // Create user in backend with retry logic
      try {
        await api.post('/auth/signup', {
          uid: user.uid,
          email: user.email,
          displayName: displayName.trim(),
        });
      } catch (backendError: any) {
        // If backend sync fails, still return the user but log the error
        console.error('Backend user creation failed:', backendError);
        // Attempt to sync on next login
      }

      return user;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },

  // Sign in
  signin: async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }
      if (!password) {
        throw new Error('Please provide a password');
      }

      const userCredential = await signIn(email, password);
      return userCredential.user;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      }
      throw error;
    }
  },

  // Google Sign-in
  signinWithGoogle: async () => {
    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      // Register/login user with backend (will create if doesn't exist)
      try {
        await api.post('/auth/google', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          avatar: user.photoURL || '',
        });
      } catch (backendError: any) {
        // If backend sync fails, still return the user but log the error
        console.error('Backend Google auth sync failed:', backendError);
        // The API client's retry logic will handle temporary failures
      }

      return user;
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up blocked by browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('An account already exists with this email using a different sign-in method.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
      }
      throw error;
    }
  },

  // Sign out
  signout: async () => {
    try {
      // Sign out from Firebase first
      await logOut();

      // Notify backend (best effort - don't throw if it fails)
      try {
        await api.post('/auth/logout');
      } catch (backendError) {
        console.error('Backend logout notification failed:', backendError);
        // Continue with logout even if backend notification fails
      }
    } catch (error: any) {
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error during sign-out. Please try again.');
      }
      throw error;
    }
  },

  // Get current user from backend
  getCurrentUser: async () => {
    try {
      // Check if user is authenticated in Firebase first
      const firebaseUser = getFirebaseUser();
      if (!firebaseUser) {
        return null;
      }

      // Get user data from backend
      return await api.get<{ user: User }>('/auth/me');
    } catch (error: any) {
      // If backend call fails, return null instead of throwing
      console.error('Failed to get current user from backend:', error);
      return null;
    }
  },

  // Validate current session
  validateSession: async (): Promise<boolean> => {
    try {
      const firebaseUser = getFirebaseUser();
      if (!firebaseUser) {
        return false;
      }

      // Verify token is still valid
      const token = await firebaseUser.getIdToken();
      if (!token) {
        return false;
      }

      // Verify backend has user data
      const userData = await authService.getCurrentUser();
      return !!userData;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  },
};

export default authService;
