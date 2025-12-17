import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" sx={{ py: 10 }}>
      <Stack spacing={3} alignItems="center">
        <Typography
          variant="h1"
          sx={{
            background: 'linear-gradient(to right, #14B8A6, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '6rem',
            fontWeight: 'bold',
          }}
        >
          404
        </Typography>
        <Typography variant="h4" fontWeight="600">
          Page Not Found
        </Typography>
        <Typography color="text.secondary">
          The page you're looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFound;
