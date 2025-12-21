import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

const NotFound = () => {
  const navigate = useNavigate();
  const { firebaseUser, isLoading } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      navigate('/login', { replace: true });
    }
  }, [firebaseUser, isLoading, navigate]);

  // Don't render if redirecting
  if (!isLoading && !firebaseUser) {
    return null;
  }

  return (
    <Box textAlign="center" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 0 } }}>
      <Stack spacing={3} alignItems="center">
        <Typography
          variant="h1"
          sx={{
            background: 'linear-gradient(to right, #14B8A6, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 'bold',
          }}
        >
          404
        </Typography>
        <Typography 
          variant="h4" 
          fontWeight="600"
          sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}
        >
          Page Not Found
        </Typography>
        <Typography 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          The page you're looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(firebaseUser ? '/dashboard' : '/login')}
          fullWidth={false}
          sx={{
            minWidth: { xs: '200px', md: 'auto' },
            fontSize: { xs: '0.875rem', md: '0.875rem' },
          }}
        >
          {firebaseUser ? 'Go to Dashboard' : 'Go to Login'}
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFound;
