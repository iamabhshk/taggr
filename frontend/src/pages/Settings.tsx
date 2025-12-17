import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Stack,
  Button,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import Navbar from '@/components/common/Navbar';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { useThemeMode } from '@/contexts/ThemeContext';
import ImportLabelsDialog from '@/components/labels/ImportLabelsDialog';
import labelService from '@/services/labelService';
import { trackEvent } from '@/utils/analytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Settings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const theme = useTheme();

  // Export labels mutation
  const exportMutation = useMutation({
    mutationFn: () => labelService.exportLabels(),
    onSuccess: (data) => {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data.labels, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taggr-labels-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      trackEvent('Labels', 'export', `Exported ${data.count} labels`);
      enqueueSnackbar(`${data.count} labels exported successfully`, { variant: 'success' });
    },
    onError: (error: any) => {
      trackEvent('Labels', 'export_error', error.message || 'Failed to export labels');
      enqueueSnackbar(error.message || 'Failed to export labels', { variant: 'error' });
    },
  });

  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === 'dark';
  const cardBg = isDark ? theme.palette.background.paper : '#ffffff';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: isDark ? theme.palette.background.default : theme.palette.grey[50] }}>
      <Navbar mode={mode} onToggleTheme={toggleTheme} />
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Settings</Typography>

          <Paper sx={{ borderRadius: '16px', boxShadow: 1, backgroundColor: cardBg }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2,
                '& .MuiTab-root': {
                  color: isDark ? theme.palette.text.secondary : '#2563EB',
                },
                '& .Mui-selected': {
                  color: '#2563EB !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#2563EB',
                },
              }}
            >
              <Tab label="Profile" />
              <Tab label="Export Data" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 2 }}>
                <ProfileSettings />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3} sx={{ px: 2 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: cardBg }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <DownloadIcon sx={{ color: theme.palette.info.main }} />
                    <Typography variant="h6">Export Data</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <Typography variant="body2" sx={{ color: isDark ? theme.palette.text.secondary : theme.palette.grey[600] }}>
                      Export all your labels as a JSON file. This includes label names, values, descriptions, and metadata.
                    </Typography>
                    <Button
                      startIcon={<DownloadIcon />}
                      variant="contained"
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                      sx={{
                        alignSelf: 'flex-start',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        },
                      }}
                    >
                      Export All Labels
                    </Button>
                  </Stack>
                </Paper>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', backgroundColor: cardBg }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <DownloadIcon sx={{ color: theme.palette.success.main }} />
                    <Typography variant="h6">Import Labels</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <Typography variant="body2" sx={{ color: isDark ? theme.palette.text.secondary : theme.palette.grey[600] }}>
                      Import labels from a JSON file. The file should contain an array of label objects.
                    </Typography>
                    <Button
                      startIcon={<DownloadIcon />}
                      variant="contained"
                      onClick={() => setIsImportDialogOpen(true)}
                      sx={{
                        alignSelf: 'flex-start',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #059669, #047857)',
                        },
                      }}
                    >
                      Import Labels
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </TabPanel>
          </Paper>
      </Box>

      <ImportLabelsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </Box>
  );
};

export default Settings;
