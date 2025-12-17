import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Stack,
  Divider,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import labelService from '@/services/labelService';
import type { Label } from '@/types';

interface VersionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  label: Label;
}

interface VersionEntry {
  version: string;
  value: string;
  changelog: string;
  publishedAt: string;
}

const VersionHistoryDialog = ({ isOpen, onClose, label }: VersionHistoryDialogProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: versionData, isLoading } = useQuery({
    queryKey: ['labelVersions', label._id],
    queryFn: () => labelService.getVersionHistory(label._id),
    enabled: isOpen && !!label._id,
  });

  const versions: VersionEntry[] = versionData?.versions || [];

  const modalBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
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
        Version History - {label.displayName}
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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : versions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No version history available
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ pt: 2 }}>
            {versions.map((version, idx) => (
              <Box key={version.version}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: 'primary.main',
                      }}
                    >
                      v{version.version}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(version.publishedAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  {version.changelog && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {version.changelog}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(0, 0, 0, 0.02)',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                  >
                    {version.value}
                  </Typography>
                </Stack>
                {idx < versions.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionHistoryDialog;

