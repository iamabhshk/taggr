import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { trackEvent } from '@/utils/analytics';
import labelService from '@/services/labelService';
import type { Label } from '@/types';

const MotionBox = motion(Box);

interface LabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  label?: Label | null;
}

const LabelModal = ({ isOpen, onClose, label }: LabelModalProps) => {
  const [formData, setFormData] = useState({
    displayName: '',
    value: '',
    description: '',
    category: '',
    tags: '',
  });
  const [errors, setErrors] = useState<any>({});
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Populate form when editing
  useEffect(() => {
    if (label) {
      setFormData({
        displayName: label.displayName,
        value: label.value,
        description: label.description || '',
        category: label.category || '',
        tags: label.tags?.join(', ') || '',
      });
    } else {
      setFormData({ displayName: '', value: '', description: '', category: '', tags: '' });
    }
  }, [label, isOpen]);

  // Auto-generate name from displayName (kebab-case)
  const generateName = (displayName: string) => {
    return displayName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Validation
  const validate = () => {
    const newErrors: any = {};
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Label name is required';
    }
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => labelService.createLabel(data),
    onSuccess: () => {
      trackEvent('Label', 'create', 'Label created successfully');
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['labelStats'] });
      enqueueSnackbar('Label created successfully!', { variant: 'success' });
      setFormData({ displayName: '', value: '', description: '', category: '', tags: '' });
      setErrors({});
      onClose();
    },
    onError: (error: any) => {
      trackEvent('Label', 'create_error', error.message || 'Failed to create label');
      enqueueSnackbar(error.message || 'Failed to create label', { variant: 'error' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      labelService.updateLabel(id, data),
    onSuccess: () => {
      trackEvent('Label', 'update', 'Label updated successfully');
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['labelStats'] });
      enqueueSnackbar('Label updated successfully!', { variant: 'success' });
      setFormData({ displayName: '', value: '', description: '', category: '', tags: '' });
      setErrors({});
      onClose();
    },
    onError: (error: any) => {
      trackEvent('Label', 'update_error', error.message || 'Failed to update label');
      enqueueSnackbar(error.message || 'Failed to update label', { variant: 'error' });
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;

    const submitData: any = {
      displayName: formData.displayName,
      value: formData.value,
    };

    if (formData.description) {
      submitData.description = formData.description;
    }

    if (formData.category) {
      submitData.category = formData.category;
    }

    if (formData.tags) {
      submitData.tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    if (label) {
      // Update existing label
      updateMutation.mutate({ id: label._id, data: submitData });
    } else {
      // Create new label
      submitData.name = generateName(formData.displayName);
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const modalBg = isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(37, 99, 235, 0.2)';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={isMobile ? 'sm' : 'lg'}
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        sx: {
          background: modalBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${borderColor}`,
          borderRadius: isMobile ? 0 : '16px',
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '95vh',
          width: isMobile ? '100%' : 'auto',
          minWidth: isMobile ? '100%' : 720,
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(37, 99, 235, 0.15)',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          pr: { xs: 5, sm: 6 },
          pt: { xs: 2, sm: 3 },
        }}
      >
        {label ? 'Edit Label' : 'Create Label'}
      </DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          borderRadius: '50%',
          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 1, sm: 2 },
          pb: { xs: 1.5, sm: 2 },
          maxHeight: isMobile ? 'calc(100vh - 170px)' : 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pt: 1,
          }}
        >
          <TextField
            required
            fullWidth
            label="Label Name"
            placeholder="e.g., Close Modal Text"
            value={formData.displayName}
            onChange={(e) =>
              setFormData({ ...formData, displayName: e.target.value })
            }
            error={!!errors.displayName}
            helperText={errors.displayName}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover fieldset': {
                  borderColor: isDark ? '#3B82F6' : '#60A5FA',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 1px #2563EB',
                },
                '&.Mui-focused': {
                  transform: 'scale(1.01)',
                },
              },
            }}
          />

          <TextField
            required
            fullWidth
            multiline
            rows={4}
            label="Value"
            placeholder="e.g., Click the button above to close"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            error={!!errors.value}
            helperText={errors.value}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover fieldset': {
                  borderColor: isDark ? '#3B82F6' : '#60A5FA',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 1px #2563EB',
                },
                '&.Mui-focused': {
                  transform: 'scale(1.01)',
                },
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (Optional)"
            placeholder="Internal note for your reference"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover fieldset': {
                  borderColor: isDark ? '#3B82F6' : '#60A5FA',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 1px #2563EB',
                },
                '&.Mui-focused': {
                  transform: 'scale(1.01)',
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Category (Optional)"
            placeholder="e.g., UI, Marketing, Error Messages"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover fieldset': {
                  borderColor: isDark ? '#3B82F6' : '#60A5FA',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 1px #2563EB',
                },
                '&.Mui-focused': {
                  transform: 'scale(1.01)',
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="Tags (Optional)"
            placeholder="e.g., modal, button, navigation (comma-separated)"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            helperText="Add tags separated by commas to help find labels later"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover fieldset': {
                  borderColor: isDark ? '#3B82F6' : '#60A5FA',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 1px #2563EB',
                },
                '&.Mui-focused': {
                  transform: 'scale(1.01)',
                },
              },
            }}
          />
        </MotionBox>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2.5 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Button
          onClick={onClose}
          fullWidth={isMobile}
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
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          fullWidth={isMobile}
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
          {label ? 'Save Changes' : 'Create Label'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabelModal;
