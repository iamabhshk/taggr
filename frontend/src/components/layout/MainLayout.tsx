import { Box, Container } from '@mui/material';
import Navbar from '@/components/common/Navbar';
import { useThemeMode } from '@/contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar mode={mode} onToggleTheme={toggleTheme} />
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 3, sm: 4 },
          pb: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout;
