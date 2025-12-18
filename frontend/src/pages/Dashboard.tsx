import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  useTheme,
  Grid,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Label as LabelIcon,
  BarChart,
  CheckCircle,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import LabelModal from '@/components/labels/LabelModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import EmptyState from '@/components/common/EmptyState';
import labelService from '@/services/labelService';
import type { Label } from '@/types';

const Dashboard = () => {
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['labelStats'],
    queryFn: () => labelService.getLabelStats(),
  });

  const {
    data: labelsData,
    isLoading: isLoadingLabels,
    isError: isLabelsError,
    error: labelsError,
    refetch: refetchLabels,
  } = useQuery({
    queryKey: ['dashboard-labels'],
    queryFn: () => labelService.getLabels({ limit: 6 }),
  });

  const handleCreateNew = () => {
    setSelectedLabel(null);
    setIsModalOpen(true);
  };

  const handleEdit = (label: Label) => {
    setSelectedLabel(label);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedLabel(null);
    setIsModalOpen(false);
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
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" fontFamily="'Inter', sans-serif">
            Manage and track your labels
          </Typography>
        </Box>

        {/* Stats Cards - Responsive Grid */}
        {isLoadingStats ? (
          <LoadingSpinner message="Loading statistics..." />
        ) : isStatsError ? (
          <ErrorDisplay
            title="Failed to load statistics"
            message={statsError instanceof Error ? statsError.message : 'An error occurred while loading statistics'}
            onRetry={() => refetchStats()}
          />
        ) : (
        <Grid container spacing={1.5}>
          {[
            {
              label: 'TOTAL LABELS',
              value: stats?.stats.totalLabels || 0,
              growth: stats?.stats.growth.labels || 0,
              icon: LabelIcon,
              gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            },
            {
              label: 'TOTAL USAGE',
              value: stats?.stats.totalUsage?.toLocaleString() || 0,
              growth: stats?.stats.growth.usage || 0,
              icon: TrendingUp,
              gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            },
            {
              label: 'AVERAGE USAGE',
              value: stats?.stats.averageUsage?.toLocaleString() || 0,
              growth: stats?.stats.growth.averageUsage || 0,
              icon: BarChart,
              gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            },
            {
              label: 'ACTIVE LABELS',
              value: stats?.stats.totalLabels || 0,
              growth: stats?.stats.growth.labels || 0,
              icon: CheckCircle,
              gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(15, 23, 42, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid',
                    borderColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(37, 99, 235, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
                      borderColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(59, 130, 246, 0.25)'
                          : 'rgba(37, 99, 235, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              letterSpacing: '0.5px',
                            }}
                          >
                            {stat.label}
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight="700"
                            sx={{
                              mt: 0.25,
                              fontFamily: "'Inter', sans-serif",
                              color: 'text.primary',
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            background: stat.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                          }}
                        >
                          <IconComponent sx={{ color: 'white', fontSize: 18 }} />
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{
                            color: stat.growth >= 0 ? 'success.main' : 'error.main',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {stat.growth >= 0 ? '↗' : '↘'} {Math.abs(stat.growth)}%
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          vs last month
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        )}

        {/* Recent Labels Section */}
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: 'text.primary',
              }}
            >
              Recent Labels
            </Typography>
            {labelsData?.labels && labelsData.labels.length > 0 && (
              <Button
                variant="text"
                onClick={() => navigate('/labels')}
                sx={{
                  color: '#2563EB',
                  fontFamily: "'Inter', sans-serif",
                  textTransform: 'none',
                }}
              >
                View All
              </Button>
            )}
          </Stack>

          {/* Labels Grid or Empty State */}
          {isLoadingLabels ? (
            <LoadingSpinner message="Loading labels..." />
          ) : isLabelsError ? (
            <ErrorDisplay
              title="Failed to load labels"
              message={labelsError instanceof Error ? labelsError.message : 'An error occurred while loading labels'}
              onRetry={() => refetchLabels()}
            />
          ) : !labelsData?.labels || labelsData.labels.length === 0 ? (
            <EmptyState
              icon={<LabelIcon />}
              title="No labels yet"
              message="Get started by creating your first label to organize and track your content"
              actionLabel="Create Your First Label"
              onAction={handleCreateNew}
            />
          ) : (
            // Labels Grid
            <Grid container spacing={2}>
              {labelsData.labels.slice(0, 6).map((label: Label) => (
                <Grid item xs={12} sm={6} md={4} key={label._id}>
                  <Card
                    sx={{
                      borderRadius: '12px',
                      p: 2,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(15, 23, 42, 0.95)'
                        : 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'dark'
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
                    <Typography
                      variant="subtitle1"
                      fontWeight="600"
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {label.displayName}
                    </Typography>
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
                      }}
                    >
                      {label.value}
                    </Typography>
                    {(label.category || (label.tags && label.tags.length > 0)) && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5, mt: 1 }}>
                        {label.category && (
                          <Chip
                            label={label.category}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                              color: theme.palette.mode === 'dark' ? '#93c5fd' : '#2563EB',
                            }}
                          />
                        )}
                        {label.tags?.slice(0, 2).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                              color: theme.palette.mode === 'dark' ? '#60a5fa' : '#2563EB',
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

      </Stack>

      <LabelModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        label={selectedLabel}
      />
    </MainLayout>
  );
};

export default Dashboard;
