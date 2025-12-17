import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 400,
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(59, 130, 246, 0.15)'
            : 'rgba(37, 99, 235, 0.1)',
          borderRadius: '16px',
        }}
      >
        <Stack spacing={3} alignItems="center">
          {icon && (
            <Box
              sx={{
                opacity: 0.3,
                fontSize: '4rem',
                color: 'primary.main',
              }}
            >
              {icon}
            </Box>
          )}
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
          {message && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: 'text.secondary',
              }}
            >
              {message}
            </Typography>
          )}
          {onAction && actionLabel && (
            <Button
              variant="contained"
              onClick={onAction}
              sx={{
                mt: 2,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                fontFamily: "'Inter', sans-serif",
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                },
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default EmptyState;

