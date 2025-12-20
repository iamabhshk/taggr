import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Label, Help, Dashboard as DashboardIcon, Add, Key as KeyIcon } from '@mui/icons-material';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ open = true, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Labels', icon: Label, path: '/labels' },
    { name: 'Tokens', icon: KeyIcon, path: '/tokens' },
    { name: 'Help', icon: Help, path: '/getting-started' },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: 260,
        height: '100%',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(139, 92, 246, 0.15)'
          : 'rgba(99, 102, 241, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(139, 92, 246, 0.15)'
            : 'rgba(99, 102, 241, 0.1)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
            }}
          >
            <DashboardIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Taggr
          </Typography>
        </Stack>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, p: 2.5 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {({ isActive }) => (
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    background: isActive
                      ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                      : 'transparent',
                    color: isActive ? 'white' : 'text.secondary',
                    boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      background: isActive
                        ? 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'
                        : theme.palette.mode === 'dark'
                        ? 'rgba(124, 58, 237, 0.1)'
                        : 'rgba(79, 70, 229, 0.08)',
                      boxShadow: isActive
                        ? '0 4px 12px rgba(79, 70, 229, 0.25)'
                        : 'none',
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'white' : 'text.secondary',
                      minWidth: 44,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <item.icon sx={{ fontSize: 24 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.95rem',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </NavLink>
        ))}
      </List>

      {/* Create New Label Button */}
      <Box sx={{ p: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={() => navigate('/labels/new')}
          sx={{
            borderRadius: 2,
            py: 1.5,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '0.95rem',
            textTransform: 'none',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            },
          }}
        >
          Create Label
        </Button>
      </Box>
    </Box>
  );

  // For mobile: temporary drawer
  if (onClose) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // For desktop: permanent drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          bgcolor: 'transparent',
          border: 'none',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark'
              ? 'rgba(139, 92, 246, 0.3)'
              : 'rgba(99, 102, 241, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? 'rgba(139, 92, 246, 0.5)'
                : 'rgba(99, 102, 241, 0.3)',
            },
          },
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
