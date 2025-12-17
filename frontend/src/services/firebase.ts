import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth functions
export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async () => {
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Enhanced token management with automatic refresh
export const getIdToken = async (forceRefresh = false) => {
  const user = getCurrentUser();
  if (!user) return null;

  try {
    // Check if token is expired or about to expire (within 5 minutes)
    if (!forceRefresh) {
      const token = await user.getIdToken();
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = decodedToken.exp * 1000;
      const shouldRefresh = (Date.now() + 5 * 60 * 1000) >= expiryTime;

      if (!shouldRefresh) {
        return token;
      }
    }

    // Force refresh token
    return user.getIdToken(true);
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = async (): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return true;

  try {
    const token = await user.getIdToken();
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = decodedToken.exp * 1000;
    const currentTime = Date.now();

    return currentTime >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Setup token refresh listener
export const setupTokenRefresh = (callback: (token: string) => void) => {
  return onIdTokenChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken(true);
        callback(token);
      } catch (error) {
        console.error('Error during token refresh:', error);
      }
    }
  });
};

// Google Sign-in
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, googleProvider);
};

export default app;
