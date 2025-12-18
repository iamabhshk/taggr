import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '@/utils/analytics';
import { useAuthStore } from '@/stores/authStore';
import { onAuthChange } from '@/services/firebase';
import authService from '@/services/authService';

export const useAuth = () => {
  const { firebaseUser, user, isLoading, setFirebaseUser, setUser, setLoading, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          const response = await authService.getCurrentUser();
          if (response && response.user) {
            setUser(response.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setUser, setLoading]);

  const handleLogout = async () => {
    try {
      await authService.signout();
      trackEvent('Authentication', 'logout', 'User logged out');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      trackEvent('Authentication', 'logout_error', 'Logout failed');
    }
  };

  return {
    firebaseUser,
    user,
    isLoading,
    isAuthenticated: !!firebaseUser,
    logout: handleLogout,
  };
};
