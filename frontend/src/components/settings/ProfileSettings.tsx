import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  InputAdornment,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import userService from '@/services/userService';

const ProfileSettings = () => {
  const { data: profileData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const user = profileData?.user;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences?.notifications ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.preferences?.pushNotifications ?? false);
  const [weeklyReport, setWeeklyReport] = useState(user?.preferences?.weeklyReport ?? true);

  // Update state when user data loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      // Initialize avatar with user's current avatar (could be URL or empty)
      const currentAvatar = user.avatar || '';
      setAvatar(currentAvatar);
      setAvatarPreview(currentAvatar);
      setEmailNotifications(user.preferences?.notifications ?? true);
      setPushNotifications(user.preferences?.pushNotifications ?? false);
      setWeeklyReport(user.preferences?.weeklyReport ?? true);
    }
  }, [user]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username === user?.username) {
      setUsernameError('');
      setIsUsernameAvailable(null);
      return;
    }

    // Validate format first
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setIsUsernameAvailable(null);
      return;
    }
    if (username.length > 20) {
      setUsernameError('Username must be 20 characters or less');
      setIsUsernameAvailable(null);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameError('Only lowercase letters, numbers, and underscores');
      setIsUsernameAvailable(null);
      return;
    }

    setUsernameError('');
    setIsCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const result = await userService.checkUsername(username);
        setIsUsernameAvailable(result.available);
        if (!result.available) {
          setUsernameError('Username is already taken');
        }
      } catch {
        setUsernameError('Failed to check availability');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username]);

  // Check if any changes were made
  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      displayName !== (user.displayName || '') ||
      username !== (user.username || '') ||
      avatar !== (user.avatar || '') ||
      emailNotifications !== (user.preferences?.notifications ?? true) ||
      pushNotifications !== (user.preferences?.pushNotifications ?? false) ||
      weeklyReport !== (user.preferences?.weeklyReport ?? true)
    );
  }, [user, displayName, username, avatar, emailNotifications, pushNotifications, weeklyReport]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        enqueueSnackbar('Please select an image file', { variant: 'error' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar('Image size must be less than 5MB', { variant: 'error' });
        return;
      }
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const canSave = hasChanges && !usernameError && !isCheckingUsername;

  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const muiTheme = useTheme();

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      enqueueSnackbar('Profile updated', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Update failed', { variant: 'error' });
    },
  });

  const handleSaveProfile = () => {
    const updateData: any = {
      displayName,
      preferences: {
        notifications: emailNotifications,
        pushNotifications,
        weeklyReport,
      },
    };

    // Only include username if it's not empty
    if (username) {
      updateData.username = username;
    }

    // Always include avatar to ensure it's saved (even if empty string)
    // Backend will only update if avatar !== undefined
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    updateProfileMutation.mutate(updateData);
  };

  return (
    <Box sx={{ maxWidth: '800px' }}>
      <Stack spacing={4}>
        {/* Personal Information */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Personal Information
          </Typography>
          <Stack spacing={3}>
            {/* Avatar Section */}
            <Box>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                Profile Picture
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems={{ xs: 'center', sm: 'flex-start' }}
              >
                <Avatar
                  src={avatarPreview}
                  alt={displayName}
                  sx={{
                    width: 100,
                    height: 100,
                    border: `2px solid ${muiTheme.palette.divider}`,
                    mb: { xs: 1, sm: 0 },
                  }}
                />
                <Stack spacing={1.5} flex={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    size="medium"
                    sx={{
                      alignSelf: { xs: 'center', sm: 'flex-start' },
                      textTransform: 'none',
                    }}
                  >
                    Upload Image
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                    />
                  </Button>
                  {avatar && (
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => {
                        setAvatar('');
                        setAvatarPreview('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      sx={{ alignSelf: { xs: 'center', sm: 'flex-start' }, textTransform: 'none' }}
                    >
                      Remove Avatar
                    </Button>
                  )}
                  <Typography variant="caption" sx={{ color: muiTheme.palette.grey[600], mt: 0.5 }}>
                    JPG, PNG or GIF. Max size 5MB
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <TextField
              fullWidth
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="your_username"
              error={!!usernameError}
              helperText={usernameError || '3-20 characters, lowercase letters, numbers, underscores only'}
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    {isCheckingUsername && <CircularProgress size={20} />}
                    {!isCheckingUsername && isUsernameAvailable === true && (
                      <CheckIcon sx={{ color: 'success.main' }} />
                    )}
                    {!isCheckingUsername && isUsernameAvailable === false && (
                      <CloseIcon sx={{ color: 'error.main' }} />
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Typography variant="body2" sx={{ color: muiTheme.palette.grey[600] }}>
              Member since {new Date(user?.createdAt || '').toLocaleDateString()}
            </Typography>

            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={!canSave || updateProfileMutation.isPending}
              sx={{
                alignSelf: 'flex-start',
                background: canSave 
                  ? 'linear-gradient(135deg, #2563EB, #3B82F6)'
                  : undefined,
                '&:hover': {
                  background: canSave
                    ? 'linear-gradient(135deg, #1D4ED8, #2563EB)'
                    : undefined,
                },
              }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* Notification Preferences */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Notification Preferences
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4F46E5',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4F46E5',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography>Email Notifications</Typography>
                  <Typography variant="caption" sx={{ color: muiTheme.palette.grey[600] }}>
                    Receive email notifications for important updates
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4F46E5',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4F46E5',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography>Push Notifications</Typography>
                  <Typography variant="caption" sx={{ color: muiTheme.palette.grey[600] }}>
                    Receive push notifications on your device
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4F46E5',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4F46E5',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography>Weekly Report</Typography>
                  <Typography variant="caption" sx={{ color: muiTheme.palette.grey[600] }}>
                    Receive a weekly summary of your activity
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </Box>

      </Stack>
    </Box>
  );
};

export default ProfileSettings;
