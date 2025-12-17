import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import PublishLabelDialog from '@/components/labels/PublishLabelDialog';
import VersionHistoryDialog from '@/components/labels/VersionHistoryDialog';
import labelService from '@/services/labelService';

const EditLabel = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [formData, setFormData] = useState({
    displayName: '',
    value: '',
    description: '',
    category: '',
    tags: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Fetch label data
  const { data: labelData, isLoading } = useQuery({
    queryKey: ['label', id],
    queryFn: () => labelService.getLabel(id!),
    enabled: !!id,
  });

  // Populate form when label data loads
  useEffect(() => {
    if (labelData?.label) {
      const label = labelData.label;
      setFormData({
        displayName: label.displayName || '',
        value: label.value || '',
        description: label.description || '',
        category: label.category || '',
        tags: label.tags?.join(', ') || '',
      });
    }
  }, [labelData]);

  // Update label mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => labelService.updateLabel(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['label', id] });
      enqueueSnackbar('Label updated successfully!', { variant: 'success' });
      navigate('/labels');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update label', { variant: 'error' });
    },
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const updateData: any = {
      displayName: formData.displayName,
      value: formData.value,
    };

    if (formData.description) {
      updateData.description = formData.description;
    }

    if (formData.category) {
      updateData.category = formData.category;
    }

    if (formData.tags) {
      updateData.tags = formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    }

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.grey[50] }}>
        <Navbar />
        <Grid container>
          <Grid item xs={12} md="auto">
            <Sidebar />
          </Grid>
          <Grid item xs={12} md sx={{ p: 4, ml: { xs: 0, md: '240px' }, textAlign: 'center', pt: 10 }}>
            <CircularProgress sx={{ color: '#14B8A6' }} />
            <Typography sx={{ mt: 2, color: theme.palette.grey[600] }}>Loading label...</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!labelData?.label) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.grey[50] }}>
        <Navbar />
        <Grid container>
          <Grid item xs={12} md="auto">
            <Sidebar />
          </Grid>
          <Grid item xs={12} md sx={{ p: 4, ml: { xs: 0, md: '240px' }, textAlign: 'center', pt: 10 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Label Not Found</Typography>
            <Typography sx={{ color: theme.palette.grey[600], mb: 3 }}>The label you're looking for doesn't exist.</Typography>
            <Button variant="contained" onClick={() => navigate('/labels')} sx={{ background: 'linear-gradient(135deg, #14B8A6, #0d9488)' }}>
              Back to Labels
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  const label = labelData.label;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.grey[50] }}>
      <Navbar />
      <Grid container>
        <Grid item xs={12} md="auto">
          <Sidebar />
        </Grid>
        <Grid item xs={12} md sx={{ p: 4, ml: { xs: 0, md: '240px' } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>Edit Label</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>Package:</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {label.packageName}
                </Typography>
                <Chip
                  label={label.isPublished ? 'Published' : 'Draft'}
                  color={label.isPublished ? 'success' : 'default'}
                  size="small"
                />
              </Stack>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => setIsPublishDialogOpen(true)}
                disabled={label.isPublished}
                sx={{
                  borderColor: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                {label.isPublished ? 'Published' : 'Publish'}
              </Button>
              <Button variant="text" onClick={() => navigate('/labels')}>
                Cancel
              </Button>
            </Stack>
          </Stack>

          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              borderRadius: '16px',
              boxShadow: 1,
              mb: 2,
            }}
          >
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="Label Name"
                placeholder="e.g., Close Modal Text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                error={!!errors.displayName}
                helperText={errors.displayName || 'User-friendly display name for this label'}
              />

              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Value"
                placeholder="e.g., Click on the button above to close the modal"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                error={!!errors.value}
                helperText={errors.value || 'The actual text content that will be exported'}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                placeholder="Internal note to help you remember what this label is for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                helperText="This description is for your reference only and won't be exported to NPM"
              />

              <TextField
                fullWidth
                label="Category (Optional)"
                placeholder="e.g., UI, Errors, Success Messages"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                helperText="Organize your labels into categories"
              />

              <TextField
                fullWidth
                label="Tags (Optional)"
                placeholder="e.g., modal, button, close"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                helperText="Comma-separated tags for easier search"
              />

              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={updateMutation.isPending}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #14B8A6, #0d9488)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                    },
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/labels')}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {label.metadata && (
            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Metadata</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>Created:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {new Date(label.metadata.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>Last Updated:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {new Date(label.metadata.updatedAt).toLocaleString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>Version:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label.version}</Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
      {labelData?.label && (
        <>
          <PublishLabelDialog
            isOpen={isPublishDialogOpen}
            onClose={() => setIsPublishDialogOpen(false)}
            label={labelData.label}
          />
          <VersionHistoryDialog
            isOpen={isVersionHistoryOpen}
            onClose={() => setIsVersionHistoryOpen(false)}
            label={labelData.label}
          />
        </>
      )}
    </Box>
  );
};

export default EditLabel;
