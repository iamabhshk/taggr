import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon, Home, Label as LabelIcon, Key as KeyIcon, Add, People as PeopleIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from '../../assets/Logo.png';
import LabelModal from '@/components/labels/LabelModal';

const MotionTab = motion(Tab);

interface NavbarProps {
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  mode?: 'light' | 'dark';
}

const Navbar = ({ onToggleSidebar, onToggleTheme, mode = 'light' }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navAnchorEl, setNavAnchorEl] = useState<null | HTMLElement>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  const getTabIndex = () => {
    if (location.pathname === '/dashboard') return 0;
    if (location.pathname === '/labels') return 1;
    if (location.pathname === '/tokens') return 2;
    if (location.pathname === '/workspaces') return 3;
    return false;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNavMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNavAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleNavMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: mode === 'light'
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(30, 41, 59, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: mode === 'light'
          ? 'rgba(37, 99, 235, 0.1)'
          : 'rgba(59, 130, 246, 0.2)',
        boxShadow: mode === 'light'
          ? '0 4px 20px rgba(37, 99, 235, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
          {onToggleSidebar && (
            <IconButton
              onClick={onToggleSidebar}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: mode === 'light' ? '#2563EB' : '#3B82F6',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: mode === 'light'
                    ? 'rgba(37, 99, 235, 0.08)'
                    : 'rgba(59, 130, 246, 0.15)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component="img"
            src={Logo}
            alt="Taggr Logo"
            onClick={() => navigate('/dashboard')}
            sx={{
              width: { xs: 40, sm: 52, md: 64 },
              height: { xs: 40, sm: 52, md: 64 },
              borderRadius: 2,
              objectFit: 'cover',
              cursor: 'pointer',
              border: '2px solid',
              borderColor: mode === 'light'
                ? 'rgba(37, 99, 235, 0.2)'
                : 'rgba(59, 130, 246, 0.3)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
              boxShadow: mode === 'light'
                ? '0 2px 8px rgba(37, 99, 235, 0.1)'
                : '0 2px 8px rgba(59, 130, 246, 0.2)',
              '&:hover': {
                boxShadow: mode === 'light'
                  ? '0 4px 12px rgba(37, 99, 235, 0.2)'
                  : '0 4px 12px rgba(59, 130, 246, 0.3)',
                borderColor: mode === 'light' ? '#2563EB' : '#3B82F6',
                transform: 'scale(1.05)',
              },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Pacifico', cursive",
              fontWeight: 700,
              color: '#2563EB',
              display: { xs: 'none', sm: 'block' },
              ml: 0.5,
            }}
          >
            Taggr
          </Typography>
        </Stack>

        {/* Navigation Tabs - hidden on extra-small screens */}
        <Tabs
          value={getTabIndex()}
          onChange={(_, index) => {
            const paths = ['/dashboard', '/labels', '/tokens', '/workspaces'];
            navigate(paths[index]);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            flexGrow: 1,
            mx: { xs: 1, sm: 2, md: 3 },
            minWidth: 0,
            display: { xs: 'none', sm: 'flex' },
            '& .MuiTabs-flexContainer': {
              gap: { xs: 0.5, sm: 1 },
            },
            '& .MuiTabScrollButton-root': {
              display: 'none',
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root.Mui-selected': {
              color: 'white',
            },
          }}
        >
          <MotionTab
            icon={<Home sx={{ fontSize: 18, color: getTabIndex() === 0 ? 'white' : 'inherit' }} />}
            iconPosition="start"
            label="Overview"
            sx={{
              minHeight: 36,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              bgcolor: getTabIndex() === 0
                ? 'rgba(37, 99, 235, 0.9)'
                : 'transparent',
              color: getTabIndex() === 0 ? 'white !important' : mode === 'light' ? 'text.primary' : 'text.secondary',
              borderRadius: 1,
              mr: 1,
              px: 2,
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: 'white !important',
              },
              '&:hover': {
                bgcolor: getTabIndex() === 0
                  ? 'rgba(37, 99, 235, 1)'
                  : mode === 'light'
                  ? 'rgba(37, 99, 235, 0.08)'
                  : 'rgba(59, 130, 246, 0.15)',
              },
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
          <MotionTab
            icon={<LabelIcon sx={{ fontSize: 18, color: getTabIndex() === 1 ? 'white' : 'inherit' }} />}
            iconPosition="start"
            label="All Labels"
            sx={{
              minHeight: 36,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              bgcolor: getTabIndex() === 1
                ? 'rgba(37, 99, 235, 0.9)'
                : 'transparent',
              color: getTabIndex() === 1 ? 'white !important' : mode === 'light' ? 'text.primary' : 'text.secondary',
              borderRadius: 1,
              mr: 1,
              px: 2,
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: 'white !important',
              },
              '&:hover': {
                bgcolor: getTabIndex() === 1
                  ? 'rgba(37, 99, 235, 1)'
                  : mode === 'light'
                  ? 'rgba(37, 99, 235, 0.08)'
                  : 'rgba(59, 130, 246, 0.15)',
              },
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
          <MotionTab
            icon={<KeyIcon sx={{ fontSize: 18, color: getTabIndex() === 2 ? 'white' : 'inherit' }} />}
            iconPosition="start"
            label="Tokens"
            sx={{
              minHeight: 36,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              bgcolor: getTabIndex() === 2
                ? 'rgba(37, 99, 235, 0.9)'
                : 'transparent',
              color: getTabIndex() === 2 ? 'white !important' : mode === 'light' ? 'text.primary' : 'text.secondary',
              borderRadius: 1,
              mr: 1,
              px: 2,
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: 'white !important',
              },
              '&:hover': {
                bgcolor: getTabIndex() === 2
                  ? 'rgba(37, 99, 235, 1)'
                  : mode === 'light'
                  ? 'rgba(37, 99, 235, 0.08)'
                  : 'rgba(59, 130, 246, 0.15)',
              },
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
          <MotionTab
            icon={<PeopleIcon sx={{ fontSize: 18, color: getTabIndex() === 3 ? 'white' : 'inherit' }} />}
            iconPosition="start"
            label="Team"
            sx={{
              minHeight: 36,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              bgcolor: getTabIndex() === 3
                ? 'rgba(37, 99, 235, 0.9)'
                : 'transparent',
              color: getTabIndex() === 3 ? 'white !important' : mode === 'light' ? 'text.primary' : 'text.secondary',
              borderRadius: 1,
              px: 2,
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: 'white !important',
              },
              '&:hover': {
                bgcolor: getTabIndex() === 3
                  ? 'rgba(37, 99, 235, 1)'
                  : mode === 'light'
                  ? 'rgba(37, 99, 235, 0.08)'
                  : 'rgba(59, 130, 246, 0.15)',
              },
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
        </Tabs>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: { xs: 1, sm: 2 } }}>
          {/* Mobile navigation menu button */}
          <IconButton
            onClick={handleNavMenuOpen}
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              borderRadius: '8px',
              bgcolor: mode === 'light'
                ? 'rgba(37, 99, 235, 0.08)'
                : 'rgba(59, 130, 246, 0.15)',
              color: mode === 'light' ? '#2563EB' : '#3B82F6',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: mode === 'light'
                  ? 'rgba(37, 99, 235, 0.15)'
                  : 'rgba(59, 130, 246, 0.25)',
              },
            }}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </IconButton>

          {onToggleTheme && (
            <IconButton
              onClick={onToggleTheme}
              sx={{
                borderRadius: '8px',
                bgcolor: mode === 'light'
                  ? 'rgba(79, 70, 229, 0.08)'
                  : 'rgba(124, 58, 237, 0.15)',
                color: mode === 'light' ? '#2563EB' : '#3B82F6',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: mode === 'light'
                    ? 'rgba(79, 70, 229, 0.15)'
                    : 'rgba(124, 58, 237, 0.25)',
                },
              }}
            >
              {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
            </IconButton>
          )}

          {/* Desktop Create Label button */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsLabelModalOpen(true)}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              bgcolor: '#000000',
              color: '#ffffff',
              borderRadius: '8px',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: '#1a1a1a',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Create Label
          </Button>
          {/* Mobile Create Label icon button */}
          <IconButton
            onClick={() => setIsLabelModalOpen(true)}
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              bgcolor: '#000000',
              color: '#ffffff',
              borderRadius: '8px',
              p: 1,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: '#1a1a1a',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Add />
          </IconButton>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid',
                  borderColor: mode === 'light'
                    ? 'rgba(79, 70, 229, 0.2)'
                    : 'rgba(124, 58, 237, 0.3)',
                  bgcolor: mode === 'light' ? '#2563EB' : '#3B82F6',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: mode === 'light'
                    ? '0 2px 8px rgba(79, 70, 229, 0.15)'
                    : '0 2px 8px rgba(124, 58, 237, 0.25)',
                  '&:hover': {
                    borderColor: mode === 'light' ? '#2563EB' : '#3B82F6',
                    boxShadow: mode === 'light'
                      ? '0 4px 12px rgba(79, 70, 229, 0.25)'
                      : '0 4px 12px rgba(124, 58, 237, 0.35)',
                  },
                }}
                alt={user?.displayName}
                src={user?.avatar}
              >
                {user?.displayName?.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: '12px',
                  bgcolor: mode === 'light'
                    ? 'rgba(255, 255, 255, 0.98)'
                    : 'rgba(30, 41, 59, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: mode === 'light'
                    ? 'rgba(79, 70, 229, 0.1)'
                    : 'rgba(124, 58, 237, 0.2)',
                  boxShadow: mode === 'light'
                    ? '0 4px 12px rgba(79, 70, 229, 0.1)'
                    : '0 4px 12px rgba(0, 0, 0, 0.5)',
                  '& .MuiMenuItem-root': {
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: mode === 'light'
                        ? 'rgba(79, 70, 229, 0.08)'
                        : 'rgba(124, 58, 237, 0.15)',
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleSettings}>Settings</MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: '#EF4444',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.08) !important',
                  },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Stack>
      </Toolbar>

      {/* Mobile navigation menu */}
      <Menu
        anchorEl={navAnchorEl}
        open={Boolean(navAnchorEl)}
        onClose={handleNavMenuClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: '12px',
            bgcolor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.98)'
              : 'rgba(30, 41, 59, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: mode === 'light'
              ? 'rgba(79, 70, 229, 0.1)'
              : 'rgba(124, 58, 237, 0.2)',
          },
        }}
      >
        <MenuItem
          selected={getTabIndex() === 0}
          onClick={() => handleNavigate('/dashboard')}
        >
          Overview
        </MenuItem>
        <MenuItem
          selected={getTabIndex() === 1}
          onClick={() => handleNavigate('/labels')}
        >
          All Labels
        </MenuItem>
        <MenuItem
          selected={getTabIndex() === 2}
          onClick={() => handleNavigate('/tokens')}
        >
          Tokens
        </MenuItem>
        <MenuItem
          selected={getTabIndex() === 3}
          onClick={() => handleNavigate('/workspaces')}
        >
          Team
        </MenuItem>
      </Menu>

      <LabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        label={null}
      />
    </AppBar>
  );
};

export default Navbar;
