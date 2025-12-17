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
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { category?: string; tags?: string[] }) => void;
  categories?: string[];
  availableTags?: string[];
  currentFilters?: { category?: string; tags?: string[] };
}

const FilterDialog = ({
  isOpen,
  onClose,
  onApply,
  categories = [],
  availableTags = [],
  currentFilters = {},
}: FilterDialogProps) => {
  const [category, setCategory] = useState(currentFilters.category || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags || []);
  const [tagInput, setTagInput] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (isOpen) {
      setCategory(currentFilters.category || '');
      setSelectedTags(currentFilters.tags || []);
    }
  }, [isOpen, currentFilters]);

  const handleTagAdd = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleApply = () => {
    onApply({
      category: category || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setCategory('');
    setSelectedTags([]);
    onApply({});
    onClose();
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
        Filter Labels
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
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <TextField
              fullWidth
              label="Tags"
              placeholder="Type and press Enter to add tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagAdd();
                }
              }}
              InputProps={{
                endAdornment: (
                  <Button size="small" onClick={handleTagAdd}>
                    Add
                  </Button>
                ),
              }}
            />
            {availableTags.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Available tags:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {availableTags
                    .filter((tag) => !selectedTags.includes(tag))
                    .slice(0, 10)
                    .map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={() => setSelectedTags([...selectedTags, tag])}
                        sx={{
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                </Stack>
              </Box>
            )}
            {selectedTags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Selected tags:
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {selectedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={() => handleTagRemove(tag)}
                      sx={{
                        fontSize: '0.7rem',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClear}
          sx={{
            borderRadius: '8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Clear All
        </Button>
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
          Cancel
        </Button>
        <Button
          onClick={handleApply}
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
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;

