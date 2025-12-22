import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  People as PeopleIcon,
  PersonAdd as InviteIcon,
  Delete as DeleteIcon,
  ExitToApp as LeaveIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import MainLayout from '@/components/layout/MainLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import workspaceService, { Workspace, WorkspaceRole } from '@/services/workspaceService';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const roleColors: Record<WorkspaceRole, 'error' | 'warning' | 'info' | 'default'> = {
  owner: 'error',
  admin: 'warning',
  editor: 'info',
  viewer: 'default',
};

const Workspaces = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading, refetchWorkspaces } = useWorkspace();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceNameError, setNewWorkspaceNameError] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmailError, setInviteEmailError] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('editor');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWorkspaceName = (name: string): string => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return 'Name must be at least 3 characters';
    if (trimmed.length > 50) return 'Name must be 50 characters or less';
    if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) return 'Only letters, numbers, spaces, and hyphens allowed';
    if (workspaces.some((w) => w.name.toLowerCase() === trimmed.toLowerCase())) {
      return 'A workspace with this name already exists';
    }
    return '';
  };

  const isExistingMember = (email: string): boolean => {
    if (!membersData?.members) return false;
    return membersData.members.some((m) => m.email?.toLowerCase() === email.toLowerCase());
  };
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuWorkspace, setMenuWorkspace] = useState<Workspace | null>(null);

  // Get members for selected workspace
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['workspaceMembers', selectedWorkspace?._id],
    queryFn: () => workspaceService.getMembers(selectedWorkspace!._id),
    enabled: !!selectedWorkspace,
  });

  // Create workspace mutation
  const createMutation = useMutation({
    mutationFn: () => workspaceService.createWorkspace({ name: newWorkspaceName, description: newWorkspaceDesc }),
    onSuccess: () => {
      enqueueSnackbar('Workspace created!', { variant: 'success' });
      refetchWorkspaces();
      setIsCreateOpen(false);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to create workspace', { variant: 'error' });
    },
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: () => workspaceService.inviteMember(selectedWorkspace!._id, inviteEmail, inviteRole),
    onSuccess: () => {
      enqueueSnackbar('Invite sent!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', selectedWorkspace?._id] });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('editor');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to send invite', { variant: 'error' });
    },
  });

  // Delete workspace mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      enqueueSnackbar('Workspace deleted', { variant: 'success' });
      refetchWorkspaces();
      if (currentWorkspace?._id === menuWorkspace?._id) {
        setCurrentWorkspace(null);
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete workspace', { variant: 'error' });
    },
  });

  // Leave workspace mutation
  const leaveMutation = useMutation({
    mutationFn: (id: string) => workspaceService.leaveWorkspace(id),
    onSuccess: () => {
      enqueueSnackbar('Left workspace', { variant: 'success' });
      refetchWorkspaces();
      if (currentWorkspace?._id === menuWorkspace?._id) {
        setCurrentWorkspace(null);
      }
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to leave workspace', { variant: 'error' });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => workspaceService.removeMember(selectedWorkspace!._id, memberId),
    onSuccess: () => {
      enqueueSnackbar('Member removed', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', selectedWorkspace?._id] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to remove member', { variant: 'error' });
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workspace: Workspace) => {
    setMenuAnchor(event.currentTarget);
    setMenuWorkspace(workspace);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuWorkspace(null);
  };

  const cardBg = isDark ? theme.palette.background.paper : '#ffffff';

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner message="Loading workspaces..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ p: { xs: 2, md: 0 } }}>
        {/* Header */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={{ xs: 2, md: 0 }}
        >
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
                fontSize: { xs: '1.75rem', md: '2.125rem' },
              }}
            >
              Workspaces
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
              Collaborate with your team on shared labels
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOpen(true)}
            fullWidth={isMobile}
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
              },
              minWidth: { xs: '100%', md: 'auto' },
            }}
          >
            Create Workspace
          </Button>
        </Stack>

        {/* Workspaces List */}
        {workspaces.length === 0 ? (
          <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderRadius: '12px', backgroundColor: cardBg }}>
            <PeopleIcon sx={{ fontSize: { xs: 48, md: 64 }, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              No workspaces yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
              Create a workspace to start collaborating with your team
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={() => setIsCreateOpen(true)}
              fullWidth={isMobile}
              sx={{ maxWidth: { xs: '100%', md: 'auto' } }}
            >
              Create Your First Workspace
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {workspaces.map((workspace) => (
              <Paper
                key={workspace._id}
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: '12px',
                  backgroundColor: cardBg,
                  border: currentWorkspace?._id === workspace._id ? '2px solid #2563EB' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#2563EB',
                  },
                }}
                onClick={() => setSelectedWorkspace(workspace)}
              >
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  spacing={{ xs: 1.5, md: 0 }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Avatar sx={{ bgcolor: '#2563EB', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
                      {workspace.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        {workspace.name}
                      </Typography>
                      <Stack 
                        direction={{ xs: 'column', md: 'row' }} 
                        spacing={{ xs: 0.5, md: 1 }} 
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        sx={{ mt: 0.5 }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                          {workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}
                        </Typography>
                        <Chip
                          label={workspace.members.find((m) => m.role)?.role || 'member'}
                          size="small"
                          color={roleColors[workspace.members[0]?.role || 'viewer']}
                          sx={{ height: 20, fontSize: '0.7rem', width: 'fit-content' }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ 
                      width: { xs: '100%', md: 'auto' },
                      justifyContent: { xs: 'flex-end', md: 'flex-start' },
                      mt: { xs: 1, md: 0 },
                    }}
                  >
                    {currentWorkspace?._id !== workspace._id && (
                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentWorkspace(workspace);
                          enqueueSnackbar(`Switched to ${workspace.name}`, { variant: 'info' });
                        }}
                        sx={{ 
                          fontSize: { xs: '0.875rem', md: '0.875rem' },
                          px: { xs: 2, md: 2.5 },
                          py: { xs: 0.75, md: 1 },
                        }}
                      >
                        Switch
                      </Button>
                    )}
                    <IconButton
                      size={isMobile ? 'small' : 'medium'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, workspace);
                      }}
                    >
                      <MoreIcon fontSize={isMobile ? 'small' : 'medium'} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Selected Workspace Members */}
        {selectedWorkspace && (
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '12px', backgroundColor: cardBg }}>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={{ xs: 2, md: 0 }}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
                {selectedWorkspace.name} - Members
              </Typography>
              <Button
                variant="outlined"
                startIcon={<InviteIcon />}
                onClick={() => setIsInviteOpen(true)}
                fullWidth={isMobile}
                sx={{ 
                  minWidth: { xs: '100%', md: 'auto' },
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 0.75, md: 1 },
                }}
              >
                Invite Member
              </Button>
            </Stack>

            {isLoadingMembers ? (
              <LoadingSpinner message="Loading members..." />
            ) : (
              <>
                {isMobile ? (
                  // Mobile: Card layout
                  <Stack spacing={2}>
                    {membersData?.members.map((member) => (
                      <Paper
                        key={member.userId}
                        sx={{
                          p: 2,
                          borderRadius: '8px',
                          backgroundColor: isDark ? theme.palette.background.default : '#f5f5f5',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                            <Avatar sx={{ width: 40, height: 40 }}>
                              {member.displayName?.charAt(0) || member.email?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.875rem' }}>
                                {member.displayName || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {member.email}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Chip
                                  label={member.role}
                                  size="small"
                                  color={roleColors[member.role]}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          {member.role !== 'owner' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  title: 'Remove Member',
                                  message: `Are you sure you want to remove ${member.displayName || member.email} from this workspace?`,
                                  onConfirm: () => {
                                    removeMemberMutation.mutate(member.userId);
                                    setConfirmDialog((prev) => ({ ...prev, open: false }));
                                  },
                                });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  // Desktop: Table layout
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Member</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Joined</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {membersData?.members.map((member) => (
                          <TableRow key={member.userId}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {member.displayName?.charAt(0) || member.email?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="500">
                                    {member.displayName || 'Unknown'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {member.email}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={member.role}
                                size="small"
                                color={roleColors[member.role]}
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {member.role !== 'owner' && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setConfirmDialog({
                                      open: true,
                                      title: 'Remove Member',
                                      message: `Are you sure you want to remove ${member.displayName || member.email} from this workspace?`,
                                      onConfirm: () => {
                                        removeMemberMutation.mutate(member.userId);
                                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                                      },
                                    });
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {membersData?.pendingInvites && membersData.pendingInvites.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontSize: { xs: '0.875rem', md: '0.875rem' } }}>
                      Pending Invites
                    </Typography>
                    <Stack spacing={1.5}>
                      {membersData.pendingInvites.map((invite) => (
                        <Paper
                          key={invite.email}
                          sx={{
                            p: { xs: 1.5, md: 2 },
                            borderRadius: '8px',
                            backgroundColor: isDark ? theme.palette.background.default : '#f5f5f5',
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            spacing={{ xs: 1, md: 0 }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', md: '0.875rem' }, wordBreak: 'break-word' }}>
                                {invite.email}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.75rem' } }}>
                                Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip 
                              label={invite.role} 
                              size="small" 
                              color={roleColors[invite.role]}
                              sx={{ mt: { xs: 0.5, md: 0 }, alignSelf: { xs: 'flex-start', md: 'center' } }}
                            />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Paper>
        )}
      </Stack>

      {/* Create Workspace Dialog */}
      <Dialog 
        open={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, md: 2 },
            borderRadius: { xs: 0, md: '8px' },
            maxHeight: { xs: '100%', md: '90vh' },
          },
        }}
      >
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Workspace Name"
              placeholder="e.g., My Team"
              value={newWorkspaceName}
              onChange={(e) => {
                setNewWorkspaceName(e.target.value);
                if (newWorkspaceNameError) {
                  setNewWorkspaceNameError(validateWorkspaceName(e.target.value));
                }
              }}
              onBlur={() => setNewWorkspaceNameError(validateWorkspaceName(newWorkspaceName))}
              error={!!newWorkspaceNameError}
              helperText={newWorkspaceNameError || '3-50 characters, letters, numbers, spaces, hyphens only'}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description (optional)"
              placeholder="What is this workspace for?"
              value={newWorkspaceDesc}
              onChange={(e) => setNewWorkspaceDesc(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate()}
            disabled={!newWorkspaceName.trim() || !!validateWorkspaceName(newWorkspaceName) || createMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog 
        open={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 0, md: 2 },
            borderRadius: { xs: 0, md: '8px' },
            maxHeight: { xs: '100%', md: '90vh' },
          },
        }}
      >
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email Address"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                if (inviteEmailError) {
                  if (validateEmail(e.target.value) && !isExistingMember(e.target.value)) {
                    setInviteEmailError('');
                  }
                }
              }}
              onBlur={() => {
                if (inviteEmail) {
                  if (!validateEmail(inviteEmail)) {
                    setInviteEmailError('Please enter a valid email address');
                  } else if (isExistingMember(inviteEmail)) {
                    setInviteEmailError('This person is already a member');
                  }
                }
              }}
              error={!!inviteEmailError}
              helperText={inviteEmailError}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                label="Role"
                onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
              >
                <MenuItem value="admin">Admin - Can manage members and labels</MenuItem>
                <MenuItem value="editor">Editor - Can create and edit labels</MenuItem>
                <MenuItem value="viewer">Viewer - Read-only access</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsInviteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => inviteMutation.mutate()}
            disabled={!inviteEmail.trim() || !validateEmail(inviteEmail) || isExistingMember(inviteEmail) || inviteMutation.isPending}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workspace Menu */}
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            setSelectedWorkspace(menuWorkspace);
            handleMenuClose();
          }}
        >
          <PeopleIcon sx={{ mr: 1 }} fontSize="small" />
          Manage Members
        </MenuItem>
        {menuWorkspace?.members[0]?.role === 'owner' ? (
          <MenuItem
            onClick={() => {
              setConfirmDialog({
                open: true,
                title: 'Delete Workspace',
                message: `Are you sure you want to delete "${menuWorkspace.name}"? This action cannot be undone.`,
                onConfirm: () => {
                  deleteMutation.mutate(menuWorkspace._id);
                  setConfirmDialog((prev) => ({ ...prev, open: false }));
                },
              });
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete Workspace
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              setConfirmDialog({
                open: true,
                title: 'Leave Workspace',
                message: `Are you sure you want to leave "${menuWorkspace!.name}"?`,
                onConfirm: () => {
                  leaveMutation.mutate(menuWorkspace!._id);
                  setConfirmDialog((prev) => ({ ...prev, open: false }));
                },
              });
              handleMenuClose();
            }}
            sx={{ color: 'warning.main' }}
          >
            <LeaveIcon sx={{ mr: 1 }} fontSize="small" />
            Leave Workspace
          </MenuItem>
        )}
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDialog.onConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Workspaces;

