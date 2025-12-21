import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Send error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container
          maxWidth="md"
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Stack spacing={3} textAlign="center" sx={{ p: 4 }}>
            <Box sx={{ fontSize: '6xl' }}>⚠️</Box>
            <Typography variant="h3" color="error.main" fontWeight="bold">
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We encountered an unexpected error. Don't worry, we're working on fixing it.
            </Typography>

            {(import.meta.env.DEV || import.meta.env.MODE === 'development') && this.state.error && (
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                  Error Details:
                </Typography>
                <Typography color="error.main" sx={{ fontSize: '0.875rem' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography
                    sx={{ mt: 1, fontSize: '0.75rem' }}
                    color="text.secondary"
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}

            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={this.handleReset}
              sx={{
                borderRadius: '50px',
                px: 6,
                textTransform: 'uppercase'
              }}
            >
              Return to Home
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
