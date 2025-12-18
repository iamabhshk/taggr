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
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { trackEvent } from '@/utils/analytics';
import labelService from '@/services/labelService';

interface ImportLabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportLabelsDialog = ({ isOpen, onClose }: ImportLabelsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const importMutation = useMutation({
    mutationFn: (labels: any[]) => labelService.importLabels(labels),
    onSuccess: (data) => {
      trackEvent('Label', 'import', `Imported ${data.imported} labels`);
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['labelStats'] });
      enqueueSnackbar(
        `Successfully imported ${data.imported} label(s). ${data.failed > 0 ? `${data.failed} failed.` : ''}`,
        { variant: 'success' }
      );
      handleClose();
    },
    onError: (error: any) => {
      trackEvent('Label', 'import_error', error.message || 'Failed to import labels');
      enqueueSnackbar(error.message || 'Failed to import labels', { variant: 'error' });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        const labels = Array.isArray(content) ? content : content.labels || [content];
        setPreview(labels);
      } catch (err) {
        setError('Invalid JSON file');
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      importMutation.mutate(preview);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  const modalBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)';

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
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
        Import Labels
      </DialogTitle>
      <IconButton
        onClick={handleClose}
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
            <input
              accept=".json,application/json"
              style={{ display: 'none' }}
              id="import-file-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="import-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  py: 2,
                  borderRadius: '8px',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#2563EB',
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                  },
                }}
              >
                {file ? file.name : 'Select JSON File'}
              </Button>
            </label>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Select a JSON file containing label data
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {preview && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Preview ({preview.length} label{preview.length !== 1 ? 's' : ''})
              </Typography>
              <Box
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  p: 2,
                  borderRadius: '8px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <pre style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={importMutation.isPending}
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
          onClick={handleImport}
          disabled={!preview || preview.length === 0 || importMutation.isPending}
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
          {importMutation.isPending ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Importing...
            </>
          ) : (
            `Import ${preview?.length || 0} Label${preview?.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportLabelsDialog;

