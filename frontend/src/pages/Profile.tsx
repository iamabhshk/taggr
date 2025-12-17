import {
  Box,
  Stack,
  Avatar,
  Typography,
  Grid,
  Paper,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import userService from '@/services/userService';

const Profile = () => {
  const { user, isLoading } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? theme.palette.background.paper : '#ffffff';
  const textColor = isDark ? theme.palette.text.primary : theme.palette.grey[800];
  const mutedColor = isDark ? theme.palette.text.secondary : theme.palette.grey[500];

  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['userActivity'],
    queryFn: () => userService.getRecentActivity(20),
    enabled: !!user,
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATE_LABEL':
        return <AddIcon fontSize="small" sx={{ color: 'success.main' }} />;
      case 'UPDATE_LABEL':
        return <EditIcon fontSize="small" sx={{ color: 'info.main' }} />;
      case 'DELETE_LABEL':
        return <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'PUBLISH_LABEL':
        return <PublishIcon fontSize="small" sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  const getActivityText = (action: string, labelName: string) => {
    switch (action) {
      case 'CREATE_LABEL':
        return `Created label "${labelName}"`;
      case 'UPDATE_LABEL':
        return `Edited label "${labelName}"`;
      case 'DELETE_LABEL':
        return `Deleted label "${labelName}"`;
      case 'PUBLISH_LABEL':
        return `Published label "${labelName}"`;
      default:
        return `Performed action on "${labelName}"`;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return time.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Loading profile..." fullHeight />
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <ErrorDisplay
          title="Failed to load profile"
          message="Unable to load your profile information. Please try refreshing the page."
          fullHeight
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Grid container spacing={3}>
        {/* User Info Section */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 4,
              borderRadius: '16px',
              boxShadow: 1,
              backgroundColor: cardBg,
            }}
          >
            <Stack spacing={3} alignItems="stretch">
              <Stack spacing={2} alignItems="center">
                <Avatar
                  sx={{ width: 96, height: 96 }}
                  alt={user?.displayName}
                  src={user?.avatar}
                />
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h5" sx={{ color: textColor, fontWeight: 700 }}>
                    {user?.displayName}
                  </Typography>
                  {user?.username ? (
                    <Typography variant="body1" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                      @{user.username}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: mutedColor, fontStyle: 'italic' }}>
                      No username set
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: mutedColor, fontSize: '0.875rem', mt: 0.5 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{user?.email}</Typography>
                  </Stack>
                </Stack>
              </Stack>

              <Stack spacing={1.5} sx={{ pt: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: mutedColor }}>
                    Member since
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: textColor, fontSize: '0.875rem' }}>
                    <CalendarIcon fontSize="small" />
                    <Typography variant="body2">
                      {user?.createdAt &&
                        new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: mutedColor }}>
                    Total Labels
                  </Typography>
                  <Typography variant="body2" sx={{ color: textColor, fontWeight: 'bold' }}>
                    {user?.stats?.totalLabels || 0}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: mutedColor }}>
                    Total Downloads
                  </Typography>
                  <Typography variant="body2" sx={{ color: textColor, fontWeight: 'bold' }}>
                    {user?.stats?.totalDownloads || 0}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Recent Activity Section */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 4,
              borderRadius: '16px',
              boxShadow: 1,
              backgroundColor: cardBg,
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: textColor, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            {isLoadingActivity ? (
              <LoadingSpinner message="Loading activity..." />
            ) : activityData?.activities && activityData.activities.length > 0 ? (
              <Stack spacing={2} alignItems="stretch">
                {activityData.activities.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? theme.palette.divider : theme.palette.grey[200]}`,
                      backgroundColor: isDark ? theme.palette.background.default : theme.palette.grey[50],
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {getActivityIcon(activity.action)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
                          {getActivityText(activity.action, activity.labelName)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: mutedColor }}>
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                      <Chip
                        label={activity.action.replace('_LABEL', '').toLowerCase()}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          textTransform: 'capitalize',
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: mutedColor }}>
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Profile;
