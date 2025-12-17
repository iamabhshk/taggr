import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect to Login page which now handles both Sign In and Sign Up
const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login with a query param to show signup form
    navigate('/login?mode=signup', { replace: true });
  }, [navigate]);

  return null;
};

export default Signup;
