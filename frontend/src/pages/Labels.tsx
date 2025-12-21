import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Typography,
  useTheme,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { Chip } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { trackEvent } from '@/utils/analytics';
import MainLayout from '@/components/layout/MainLayout';
import LabelModal from '@/components/labels/LabelModal';
import FilterDialog from '@/components/labels/FilterDialog';
import VersionHistoryDialog from '@/components/labels/VersionHistoryDialog';
import ImportLabelsDialog from '@/components/labels/ImportLabelsDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import EmptyState from '@/components/common/EmptyState';
import labelService from '@/services/labelService';
import type { Label } from '@/types';

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

const Labels = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [versionHistoryLabel, setVersionHistoryLabel] = useState<Label | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{ category?: string; tags?: string[] }>({});
  const [deleteConfirmLabel, setDeleteConfirmLabel] = useState<Label | null>(null);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(filters.category || (filters.tags && filters.tags.length > 0));
  }, [filters]);

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
    setSearchQuery('');
  };

  const {
    data: labelsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['labels', searchQuery, filters],
    queryFn: () => labelService.getLabels({
      query: searchQuery,
      category: filters.category,
      tags: filters.tags,
      limit: 100,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => labelService.deleteLabel(id),
    onSuccess: () => {
      trackEvent('Label', 'delete', 'Label deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['labelStats'] });
      enqueueSnackbar('Label deleted', { variant: 'success' });
    },
    onError: (error: any) => {
      trackEvent('Label', 'delete_error', error.message || 'Failed to delete label');
      enqueueSnackbar('Failed to delete label', { variant: 'error' });
    },
  });

  const handleEdit = (label: Label) => {
    setSelectedLabel(label);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedLabel(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedLabel(null);
    setIsModalOpen(false);
  };

  const labels = labelsData?.labels || [];
  
  // Extract unique categories and tags for filter dialog
  const allCategories = Array.from(new Set(labels.map((l: Label) => l.category).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(labels.flatMap((l: Label) => l.tags || []))) as string[];
  const cardBg = isDark ? theme.palette.background.paper : '#ffffff';
  const mutedColor = isDark ? theme.palette.text.secondary : theme.palette.grey[500];

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 0 } }}>
        {/* Search and Actions */}
        <MotionStack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: { xs: 2, md: 3 },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: mutedColor }} />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{
              maxWidth: { xs: '100%', sm: '400px' },
              backgroundColor: cardBg,
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                fontSize: '0.875rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover fieldset': {
                  borderColor: '#2563EB',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                  boxShadow: '0 0 0 1px #2563EB',
                },
              },
            }}
          />
          <Button
            variant={hasActiveFilters ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FilterListIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => setIsFilterDialogOpen(true)}
            sx={{
              borderRadius: '6px',
              fontSize: '0.8rem',
              px: { xs: 1.25, sm: 1.5 },
              py: 0.5,
              backgroundColor: hasActiveFilters ? '#2563EB' : cardBg,
              color: hasActiveFilters ? 'white' : undefined,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 1,
                backgroundColor: hasActiveFilters ? '#1D4ED8' : undefined,
              },
            }}
          >
            Filters {hasActiveFilters && `(${(filters.category ? 1 : 0) + (filters.tags?.length || 0)})`}
          </Button>
          {(hasActiveFilters || searchInput) && (
            <Button
              variant="text"
              size="small"
              onClick={clearFilters}
              sx={{
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: mutedColor,
                '&:hover': {
                  color: '#2563EB',
                },
              }}
            >
              Clear
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleCreateNew}
            fullWidth={isMobile}
            sx={{
              borderRadius: '6px',
              fontSize: '0.8rem',
              px: { xs: 1.25, sm: 1.5 },
              py: 0.5,
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              },
            }}
          >
            Create Label
          </Button>
        </MotionStack>

        {/* Labels Grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading labels..." />
        ) : isError ? (
          <ErrorDisplay
            title="Failed to load labels"
            message={error instanceof Error ? error.message : 'An error occurred while loading labels'}
            onRetry={() => refetch()}
          />
        ) : labels.length === 0 ? (
          <EmptyState
            icon={<Typography sx={{ fontSize: 64 }}>🏷️</Typography>}
            title={searchQuery ? 'No labels found' : 'No labels yet'}
            message={
              searchQuery
                ? `No labels match your search "${searchQuery}". Try a different search term.`
                : 'Get started by creating your first label to organize and track your content'
            }
            actionLabel={searchQuery ? undefined : 'Create Your First Label'}
            onAction={searchQuery ? undefined : handleCreateNew}
          />
        ) : (
          <Grid
            container
            spacing={{ xs: 1.5, md: 2 }}
          >
            {labels.map((label: Label) => (
              <Grid item xs={12} sm={6} md={4} key={label._id}>
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                >
                  <Paper
                    sx={{
                      borderRadius: '12px',
                      p: { xs: 1.5, md: 2 },
                      background: isDark
                        ? 'rgba(15, 23, 42, 0.95)'
                        : 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid',
                      borderColor: isDark
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(37, 99, 235, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#2563EB',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                      },
                    }}
                    onClick={() => handleEdit(label)}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="600"
                          sx={{
                            fontFamily: "'Inter', sans-serif",
                            color: 'text.primary',
                            flex: 1,
                            minWidth: 0,
                            fontSize: { xs: '0.9375rem', md: '1rem' },
                          }}
                        >
                          {label.displayName}
                        </Typography>
                        <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0 }}>
                          <IconButton
                            size={isMobile ? 'small' : 'small'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(label);
                            }}
                            sx={{
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: isMobile ? 'none' : 'scale(1.1)',
                                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                              },
                            }}
                          >
                            <EditIcon fontSize={isMobile ? 'small' : 'small'} />
                          </IconButton>
                          <IconButton
                            size={isMobile ? 'small' : 'small'}
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmLabel(label);
                            }}
                            disabled={deleteMutation.isPending}
                            sx={{
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: isMobile ? 'none' : 'scale(1.1)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize={isMobile ? 'small' : 'small'} />
                          </IconButton>
                        </Stack>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: "'Inter', sans-serif",
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: { xs: '0.8125rem', md: '0.875rem' },
                        }}
                      >
                        {label.value}
                      </Typography>
                      {(label.category || (label.tags && label.tags.length > 0)) && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                          {label.category && (
                            <Chip
                              label={label.category}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: { xs: '0.6rem', md: '0.65rem' },
                                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                                color: isDark ? '#93c5fd' : '#2563EB',
                              }}
                            />
                          )}
                          {label.tags?.slice(0, 3).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: { xs: '0.6rem', md: '0.65rem' },
                                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                                color: isDark ? '#60a5fa' : '#2563EB',
                              }}
                            />
                          ))}
                        </Stack>
                      )}
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 0.5, sm: 2 }} 
                        sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' }, color: mutedColor }} 
                        flexWrap="wrap"
                      >
                        <Typography variant="caption">
                          {label.metadata.downloads || 0} pulls
                        </Typography>
                        <Typography variant="caption">
                          Created: {new Date(label.metadata.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption">
                          Updated: {new Date(label.metadata.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      {/* CLI Usage Section */}
                      <Box
                        sx={{
                          mt: 1,
                          pt: 1.5,
                          borderTop: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <TerminalIcon sx={{ fontSize: 14, color: mutedColor }} />
                          <Typography variant="caption" sx={{ color: mutedColor, fontWeight: 500 }}>
                            Quick Use
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Box
                            component="code"
                            sx={{
                              flex: 1,
                              p: 1,
                              borderRadius: '6px',
                              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                              fontSize: '0.7rem',
                              fontFamily: 'monospace',
                              color: isDark ? '#93c5fd' : '#2563EB',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            taggr pull {label.name}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(`taggr pull ${label.name}`);
                              enqueueSnackbar('Command copied!', { variant: 'success' });
                            }}
                            sx={{
                              p: 0.5,
                              '&:hover': {
                                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                              },
                            }}
                          >
                            <CopyIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <LabelModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        label={selectedLabel}
      />
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApply={(newFilters: { category?: string; tags?: string[] }) => setFilters(newFilters)}
        categories={allCategories}
        availableTags={allTags}
        currentFilters={filters}
      />
      {versionHistoryLabel && (
        <VersionHistoryDialog
          isOpen={!!versionHistoryLabel}
          onClose={() => setVersionHistoryLabel(null)}
          label={versionHistoryLabel}
        />
      )}
      <ImportLabelsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
      <Dialog
        open={!!deleteConfirmLabel}
        onClose={() => setDeleteConfirmLabel(null)}
      >
        <DialogTitle>Delete Label</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{deleteConfirmLabel?.displayName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmLabel(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteConfirmLabel) {
                deleteMutation.mutate(deleteConfirmLabel._id);
                setDeleteConfirmLabel(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Labels;
