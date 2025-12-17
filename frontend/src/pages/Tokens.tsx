import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  useTheme,
} from '@mui/material';
import {
  Key as KeyIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import tokenService from '@/services/tokenService';
import { trackEvent } from '@/utils/analytics';

const Tokens = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isNewTokenOpen, setIsNewTokenOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? theme.palette.background.paper : '#ffffff';
  const codeBg = isDark ? 'rgba(0, 0, 0, 0.3)' : theme.palette.grey[100];
  const codeColor = isDark ? '#93c5fd' : 'inherit';

  // Fetch tokens
  const {
    data: tokensData,
    isLoading: isLoadingTokens,
    isError: isTokensError,
    error: tokensError,
    refetch: refetchTokens,
  } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => tokenService.listTokens(),
  });

  // Generate token mutation
  const generateTokenMutation = useMutation({
    mutationFn: async (name: string) => {
      return tokenService.generateToken(name);
    },
    onSuccess: (response) => {
      trackEvent('Token', 'generate', 'Token generated');
      setGeneratedToken(response.apiKey.key);
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      enqueueSnackbar('Token generated. Make sure to copy it - you won\'t be able to see it again!', { variant: 'success' });
    },
    onError: (error: any) => {
      trackEvent('Token', 'generate_error', error.message || 'Failed to generate token');
      enqueueSnackbar(error.message || 'Failed to generate token', { variant: 'error' });
    },
  });

  // Delete token mutation
  const deleteTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      return tokenService.revokeToken(id);
    },
    onSuccess: () => {
      trackEvent('Token', 'revoke', 'Token revoked');
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      enqueueSnackbar('Token revoked', { variant: 'success' });
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      trackEvent('Token', 'revoke_error', error.message || 'Failed to revoke token');
      enqueueSnackbar(error.message || 'Failed to revoke token', { variant: 'error' });
    },
  });

  // Regenerate token mutation
  const regenerateTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      return tokenService.regenerateToken(id);
    },
    onSuccess: (response) => {
      trackEvent('Token', 'regenerate', 'Token regenerated');
      setGeneratedToken(response.apiKey.key);
      setIsNewTokenOpen(true);
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      enqueueSnackbar('Token regenerated. Make sure to copy it!', { variant: 'success' });
    },
    onError: (error: any) => {
      trackEvent('Token', 'regenerate_error', error.message || 'Failed to regenerate token');
      enqueueSnackbar(error.message || 'Failed to regenerate token', { variant: 'error' });
    },
  });

  const handleGenerateToken = () => {
    if (!newTokenName.trim()) {
      enqueueSnackbar('Please enter a name for your token', { variant: 'error' });
      return;
    }
    generateTokenMutation.mutate(newTokenName);
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
  };

  const handleDeleteToken = (id: string) => {
    setTokenToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (tokenToDelete) {
      deleteTokenMutation.mutate(tokenToDelete);
    }
  };

  const handleCloseNewTokenModal = () => {
    setIsNewTokenOpen(false);
    setGeneratedToken('');
    setNewTokenName('');
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Tokens
          </Typography>
          <Typography variant="body2" color="text.secondary" fontFamily="'Inter', sans-serif">
            Manage your tokens for CLI authentication
          </Typography>
        </Box>

        {/* Tokens Section */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: cardBg }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <KeyIcon sx={{ color: '#2563EB' }} />
              <Typography variant="h6">Your Tokens</Typography>
            </Stack>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setIsNewTokenOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                },
              }}
            >
              Generate New Token
            </Button>
          </Stack>
          <Typography variant="body2" sx={{ color: theme.palette.grey[600], mb: 2 }}>
            Tokens allow you to authenticate with the Taggr CLI when pulling your labels.
          </Typography>

          {isLoadingTokens ? (
            <LoadingSpinner message="Loading tokens..." />
          ) : isTokensError ? (
            <ErrorDisplay
              title="Failed to load tokens"
              message={tokensError instanceof Error ? tokensError.message : 'An error occurred while loading tokens'}
              onRetry={() => refetchTokens()}
            />
          ) : tokensData?.apiKeys?.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : theme.palette.grey[50], borderRadius: '8px' }}>
              <Typography sx={{ color: theme.palette.grey[500], mb: 2 }}>No tokens yet</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => setIsNewTokenOpen(true)}
                sx={{ color: '#2563EB', borderColor: '#2563EB' }}
              >
                Create Your First Token
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokensData?.apiKeys?.map((token: any) => (
                    <TableRow key={token._id}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{token.name}</TableCell>
                      <TableCell>
                        <Box
                          component="code"
                          sx={{
                            fontSize: '0.75rem',
                            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : theme.palette.grey[100],
                            px: 1,
                            py: 0.5,
                            borderRadius: '4px',
                          }}
                        >
                          {token.keyPreview}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: theme.palette.grey[600] }}>
                        {new Date(token.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={token.isActive ? 'Active' : 'Revoked'}
                          color={token.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => regenerateTokenMutation.mutate(token._id)}
                            disabled={regenerateTokenMutation.isPending}
                            title="Regenerate token"
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteToken(token._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* How to Use Section */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: cardBg }}>
          <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>How to Use Your Token</Typography>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Step 1: Install the Taggr CLI</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600], mb: 1 }}>
                Open your terminal and run:
              </Typography>
              <Box component="pre" sx={{ display: 'block', p: 2, m: 0, backgroundColor: codeBg, borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: codeColor, whiteSpace: 'pre-wrap' }}>
                npm install -g @taggr/cli
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Step 2: Authenticate</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600], mb: 1 }}>
                Copy your token from above and run:
              </Typography>
              <Box component="pre" sx={{ display: 'block', p: 2, m: 0, backgroundColor: codeBg, borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: codeColor, whiteSpace: 'pre-wrap' }}>
                taggr login {'<your-token>'}
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.grey[500], mt: 1, fontSize: '0.8rem' }}>
                You only need to do this once. Your token is saved locally.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Step 3: Pull Your Labels</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600], mb: 1 }}>
                Navigate to your project folder and run:
              </Typography>
              <Box component="pre" sx={{ display: 'block', p: 2, m: 0, backgroundColor: codeBg, borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: codeColor, whiteSpace: 'pre-wrap' }}>
                taggr pull --all
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.grey[500], mt: 1, fontSize: '0.8rem' }}>
                This creates a ./taggr folder with labels.json and labels.d.ts files.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Step 4: Use in Your Code</Typography>
              <Box component="pre" sx={{ display: 'block', p: 2, m: 0, backgroundColor: codeBg, borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: codeColor, whiteSpace: 'pre-wrap' }}>
{`import labels from './taggr/labels.json';

console.log(labels.welcomeMessage);
console.log(labels.submitButton);

// Or destructure what you need
const { myLabel, submitButton } = labels;`}
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Step 5: Keep Labels in Sync</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600], mb: 1 }}>
                Run this command anytime you update labels in the dashboard:
              </Typography>
              <Box component="pre" sx={{ display: 'block', p: 2, m: 0, backgroundColor: codeBg, borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: codeColor, whiteSpace: 'pre-wrap' }}>
                taggr pull --all
              </Box>
            </Box>
          </Stack>
        </Paper>

        {/* Other Commands Section */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: cardBg }}>
          <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem' }}>Other Useful Commands</Typography>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ textAlign: 'left', p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>Command</Box>
                <Box component="th" sx={{ textAlign: 'left', p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>Description</Box>
              </Box>
            </Box>
            <Box component="tbody">
              <Box component="tr">
                <Box component="td" sx={{ p: 1, fontFamily: 'monospace', color: codeColor }}>taggr whoami</Box>
                <Box component="td" sx={{ p: 1, color: theme.palette.grey[600] }}>Check which account you're logged in as</Box>
              </Box>
              <Box component="tr">
                <Box component="td" sx={{ p: 1, fontFamily: 'monospace', color: codeColor }}>taggr list</Box>
                <Box component="td" sx={{ p: 1, color: theme.palette.grey[600] }}>View all your labels</Box>
              </Box>
              <Box component="tr">
                <Box component="td" sx={{ p: 1, fontFamily: 'monospace', color: codeColor }}>taggr logout</Box>
                <Box component="td" sx={{ p: 1, color: theme.palette.grey[600] }}>Sign out from CLI</Box>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.grey[500], mt: 2, fontSize: '0.8rem' }}>
            Tip: Add ./taggr to your .gitignore if you don't want to commit generated files.
          </Typography>
        </Paper>
      </Stack>

      {/* New Token Modal */}
      <Dialog
        open={isNewTokenOpen}
        onClose={handleCloseNewTokenModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{generatedToken ? 'Your New Token' : 'Generate New Token'}</DialogTitle>
        <DialogContent>
          {generatedToken ? (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                Make sure to copy your token now. You won't be able to see it again!
              </Typography>
              <Stack direction="row" spacing={1}>
                <Box
                  component="code"
                  sx={{
                    flex: 1,
                    p: 2,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : theme.palette.grey[100],
                    borderRadius: '8px',
                    wordBreak: 'break-all',
                  }}
                >
                  {generatedToken}
                </Box>
                <IconButton onClick={() => handleCopyToken(generatedToken)}>
                  <CopyIcon />
                </IconButton>
              </Stack>
            </Stack>
          ) : (
            <TextField
              fullWidth
              label="Token Name"
              placeholder="e.g., Development Machine"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {generatedToken ? (
            <Button onClick={handleCloseNewTokenModal} sx={{ color: '#2563EB' }}>
              Done
            </Button>
          ) : (
            <>
              <Button onClick={handleCloseNewTokenModal}>Cancel</Button>
              <Button
                onClick={handleGenerateToken}
                disabled={generateTokenMutation.isPending}
                sx={{ color: '#2563EB' }}
              >
                Generate
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <DialogTitle>Revoke Token</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to revoke this token? Any applications using this token will no longer be able to authenticate.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            disabled={deleteTokenMutation.isPending}
            color="error"
          >
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Tokens;

