import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { trackEvent } from '@/utils/analytics';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import labelService from '@/services/labelService';

const CreateLabel = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    value: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ displayName?: string; value?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const bg = isDark ? theme.palette.background.default : theme.palette.grey[50];
  const textColor = isDark ? theme.palette.text.primary : theme.palette.grey[800];
  const mutedColor = isDark ? theme.palette.text.secondary : theme.palette.grey[500];

  // Helper: Convert displayName to name (camelCase, no spaces)
  const generateName = (displayName: string) => {
    return displayName
      .trim()
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/^(.)/, (_, char) => char.toLowerCase());
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Label name is required';
    }
    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Generate name from displayName
      const name = generateName(formData.displayName);

      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0)
        : undefined;

      const response = await labelService.createLabel({
        name,
        displayName: formData.displayName,
        value: formData.value,
        description: formData.description || undefined,
        category: formData.category || undefined,
        tags: tagsArray,
      });

      trackEvent('Label', 'create', 'Label created from CreateLabel page');
      enqueueSnackbar(
        `Label created successfully! Created at ${new Date(response.data.label.metadata.createdAt).toLocaleString()}`,
        { variant: 'success' }
      );

      navigate('/labels');
    } catch (error: any) {
      trackEvent('Label', 'create_error', error.message || 'Failed to create label');
      enqueueSnackbar(error.message || 'Failed to create label', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: bg }}>
      <Navbar />
      <Grid container>
        <Grid item xs={12} md="auto">
          <Sidebar />
        </Grid>
        <Grid item xs={12} md sx={{ p: 4, ml: { xs: 0, md: '240px' } }}>
          <Typography variant="h4" sx={{ mb: 3, color: textColor, fontWeight: 'bold' }}>
            Create New Label
          </Typography>

          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              maxWidth: '600px',
              borderRadius: '16px',
              boxShadow: 1,
            }}
          >
            <Stack spacing={3}>
              <Box>
                <TextField
                  required
                  fullWidth
                  label="Label Name"
                  placeholder="e.g., Close Modal Text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  error={!!errors.displayName}
                  helperText={errors.displayName || 'Enter a friendly name (e.g., "Close Modal Text") - will be auto-converted to camelCase'}
                />
              </Box>

              <Box>
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
                  helperText={errors.value}
                />
              </Box>

              <Box>
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
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Category (Optional)"
                  placeholder="e.g., UI, Marketing, Error Messages"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  helperText="Organize labels by category"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Tags (Optional)"
                  placeholder="e.g., modal, button, navigation (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  helperText="Add tags separated by commas to help find labels later"
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                  },
                }}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={20} sx={{ mr: 1, display: 'inline-flex' }} />
                    Creating...
                  </>
                ) : (
                  'Create Label'
                )}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateLabel;
