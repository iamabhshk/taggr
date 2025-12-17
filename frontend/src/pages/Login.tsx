import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { trackEvent } from '@/utils/analytics';
import authService from '@/services/authService';
import { useSnackbar } from 'notistack';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (isSignUp && !displayName) newErrors.displayName = 'Name is required';
    if (isSignUp && password && password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      if (isSignUp) {
        await authService.signup(email, password, displayName);
        trackEvent('Authentication', 'signup', 'Email signup');
        enqueueSnackbar('Account created successfully!', { variant: 'success' });
      } else {
        await authService.signin(email, password);
        trackEvent('Authentication', 'login', 'Email login');
        enqueueSnackbar('Welcome back!', { variant: 'success' });
      }
      navigate('/dashboard');
    } catch (error: any) {
      trackEvent('Authentication', isSignUp ? 'signup_error' : 'login_error', error.message);
      enqueueSnackbar(error.message || 'Authentication failed', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authService.signinWithGoogle();
      trackEvent('Authentication', 'login', 'Google login');
      enqueueSnackbar('Successfully signed in!', { variant: 'success' });
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message && !error.message.includes('cancelled')) {
        enqueueSnackbar(error.message || 'Could not sign in with Google', { variant: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#EFF6FF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner Decorative Shapes - Blue theme */}
      <Box
        sx={{
          position: 'fixed',
          top: '-80px',
          right: '-80px',
          width: '250px',
          height: '250px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          animation: 'morphShape1 8s ease-in-out infinite, float1 6s ease-in-out infinite',
          zIndex: 0,
          opacity: 0.7,
          '@keyframes morphShape1': {
            '0%, 100%': { borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' },
            '50%': { borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%' },
          },
          '@keyframes float1': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(-10px, 10px) rotate(5deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-60px',
          left: '-60px',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          animation: 'morphShape2 10s ease-in-out infinite, float2 7s ease-in-out infinite',
          zIndex: 0,
          opacity: 0.6,
          '@keyframes morphShape2': {
            '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
            '50%': { borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%' },
          },
          '@keyframes float2': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(15px, -10px) rotate(-5deg)' },
          },
        }}
      />

      {/* Main Container */}
      <Box
        sx={{
          width: '900px',
          maxWidth: '95vw',
          height: '550px',
          bgcolor: '#fff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* Sign In Form (Left side when not signing up) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            transition: 'all 0.6s ease-in-out',
            opacity: isSignUp ? 0 : 1,
            zIndex: isSignUp ? 1 : 5,
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '320px' }}>
            <Typography
              variant="h4"
              fontWeight="700"
              textAlign="center"
              sx={{
                mb: 3,
                color: '#2563EB',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Sign In
            </Typography>

            {/* Social Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <IconButton
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                sx={{
                  width: 44,
                  height: 44,
                  border: '1px solid #e0e0e0',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.05)' },
                }}
              >
                <FcGoogle size={20} />
              </IconButton>
            </Stack>

            <Typography variant="caption" textAlign="center" display="block" color="text.secondary" sx={{ mb: 2 }}>
              or use your email for login:
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaEnvelope color="#9e9e9e" size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <TextField
                fullWidth
                size="small"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLock color="#9e9e9e" size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                },
              }}
            >
              {isLoading ? 'Signing in...' : 'SIGN IN'}
            </Button>
          </Box>
        </Box>

        {/* Sign Up Form (Right side when signing up) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            transition: 'all 0.6s ease-in-out',
            opacity: isSignUp ? 1 : 0,
            zIndex: isSignUp ? 5 : 1,
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '320px' }}>
            <Typography
              variant="h4"
              fontWeight="700"
              textAlign="center"
              sx={{
                mb: 3,
                color: '#2563EB',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Create Account
            </Typography>

            {/* Social Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <IconButton
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                sx={{
                  width: 44,
                  height: 44,
                  border: '1px solid #e0e0e0',
                  '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.05)' },
                }}
              >
                <FcGoogle size={20} />
              </IconButton>
            </Stack>

            <Typography variant="caption" textAlign="center" display="block" color="text.secondary" sx={{ mb: 2 }}>
              or use your email for registration:
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Name"
                error={!!errors.displayName}
                helperText={errors.displayName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaUser color="#9e9e9e" size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <TextField
                fullWidth
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaEnvelope color="#9e9e9e" size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <TextField
                fullWidth
                size="small"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLock color="#9e9e9e" size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f5f5f5',
                    borderRadius: '8px',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                },
              }}
            >
              {isLoading ? 'Creating account...' : 'SIGN UP'}
            </Button>
          </Box>
        </Box>

        {/* Sliding Overlay Panel */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: isSignUp ? 0 : '50%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #1D4ED8 100%)',
            borderRadius: isSignUp ? '0 24px 24px 0' : '24px 0 0 24px',
            transition: 'all 0.6s ease-in-out',
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          {/* Floating Squares */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '60px',
              height: '60px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              animation: 'floatRotate 12s ease-in-out infinite',
              '@keyframes floatRotate': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: 0.3 },
                '50%': { transform: 'translateY(-20px) rotate(45deg)', opacity: 0.6 },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '15%',
              width: '40px',
              height: '40px',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              animation: 'floatRotate 10s ease-in-out infinite',
              animationDelay: '2s',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              right: '10%',
              width: '50px',
              height: '50px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              animation: 'floatRotate 14s ease-in-out infinite',
              animationDelay: '1s',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '20%',
              width: '35px',
              height: '35px',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              animation: 'floatRotate 8s ease-in-out infinite',
              animationDelay: '3s',
            }}
          />

          {/* Overlay Content */}
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
              color: 'white',
            }}
          >
            <Typography
              variant="h3"
              fontWeight="800"
              sx={{
                mb: 2,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {isSignUp ? 'Hello, Friend!' : 'Welcome Back!'}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                opacity: 0.9,
                maxWidth: '280px',
                lineHeight: 1.6,
              }}
            >
              {isSignUp
                ? 'Enter your personal details and start your journey with us'
                : 'To keep connected with us please login with your personal info'}
            </Typography>
            <Button
              variant="outlined"
              onClick={toggleMode}
              sx={{
                color: 'white',
                borderColor: 'white',
                borderWidth: '2px',
                borderRadius: '24px',
                px: 5,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderWidth: '2px',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {isSignUp ? 'SIGN IN' : 'SIGN UP'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
