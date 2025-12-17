import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { trackEvent } from '@/utils/analytics';
import labelService from '@/services/labelService';
import type { Label } from '@/types';

interface PublishLabelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  label: Label;
}

const PublishLabelDialog = ({ isOpen, onClose, label }: PublishLabelDialogProps) => {
  const [versionBump, setVersionBump] = useState<'major' | 'minor' | 'patch'>('patch');
  const [changelog, setChangelog] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Calculate new version
  const calculateNewVersion = (currentVersion: string, bump: 'major' | 'minor' | 'patch') => {
    const parts = currentVersion.split('.').map(Number);
    if (bump === 'major') {
      return `${parts[0] + 1}.0.0`;
    } else if (bump === 'minor') {
      return `${parts[0]}.${parts[1] + 1}.0`;
    } else {
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }
  };

  const newVersion = calculateNewVersion(label.version, versionBump);

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (data: { changelog?: string; versionBump: 'major' | 'minor' | 'patch' }) =>
      labelService.publishLabel(label._id, data.changelog, data.versionBump),
    onSuccess: () => {
      trackEvent('Label', 'publish', `Label published: ${label.name}`);
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['label', label._id] });
      queryClient.invalidateQueries({ queryKey: ['labelStats'] });
      enqueueSnackbar(`Label published successfully as version ${newVersion}!`, { variant: 'success' });
      setChangelog('');
      setVersionBump('patch');
      onClose();
    },
    onError: (error: any) => {
      trackEvent('Label', 'publish_error', error.message || 'Failed to publish label');
      enqueueSnackbar(error.message || 'Failed to publish label', { variant: 'error' });
    },
  });

  const handlePublish = () => {
    publishMutation.mutate({
      changelog: changelog.trim() || undefined,
      versionBump,
    });
  };

  const modalBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        sx: {
          background: modalBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(37, 99, 235, 0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          pr: 6,
        }}
      >
        Publish Label
      </DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          borderRadius: '50%',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'rotate(90deg) scale(1.1)',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Current Version
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              {label.packageName}@{label.version}
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Version Bump</InputLabel>
            <Select
              value={versionBump}
              label="Version Bump"
              onChange={(e) => setVersionBump(e.target.value as 'major' | 'minor' | 'patch')}
            >
              <MenuItem value="patch">Patch (x.x.{parseInt(label.version.split('.')[2]) + 1})</MenuItem>
              <MenuItem value="minor">Minor (x.{parseInt(label.version.split('.')[1]) + 1}.0)</MenuItem>
              <MenuItem value="major">Major ({parseInt(label.version.split('.')[0]) + 1}.0.0)</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              New Version
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
              {newVersion}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Changelog (Optional)"
            placeholder="Describe what changed in this version..."
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            helperText="This will be included in the version history"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={publishMutation.isPending}
          sx={{
            borderRadius: '8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePublish}
          disabled={publishMutation.isPending}
          variant="contained"
          sx={{
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {publishMutation.isPending ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Publishing...
            </>
          ) : (
            'Publish to npm'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishLabelDialog;

