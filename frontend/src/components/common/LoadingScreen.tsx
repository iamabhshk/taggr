import { Box, CircularProgress, Typography, Stack } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main'
          }}
        />
        <Typography variant="body1" color="text.secondary">
          Loading Taggr...
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoadingScreen;
