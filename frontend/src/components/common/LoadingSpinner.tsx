import { CircularProgress, Box, BoxProps } from '@mui/material';

interface LoadingSpinnerProps extends BoxProps {
  size?: number;
  message?: string;
}

const LoadingSpinner = ({ size = 40, message, sx, ...props }: LoadingSpinnerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
        ...sx,
      }}
      {...props}
    >
      <CircularProgress size={size} />
      {message && (
        <Box
          component="p"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );
};

export default LoadingSpinner;

