import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullHeight?: boolean;
}

const ErrorDisplay = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  fullHeight = false,
}: ErrorDisplayProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullHeight ? '60vh' : 'auto',
        py: 4,
      }}
    >
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          maxWidth: 500,
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(239, 68, 68, 0.1)',
          borderRadius: '16px',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <ErrorOutline
            sx={{
              fontSize: 64,
              color: 'error.main',
              opacity: 0.8,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: 'text.secondary',
            }}
          >
            {message}
          </Typography>
          {onRetry && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{
                mt: 2,
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                textTransform: 'none',
              }}
            >
              {retryLabel}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ErrorDisplay;

