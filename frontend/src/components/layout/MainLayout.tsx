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
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout;
