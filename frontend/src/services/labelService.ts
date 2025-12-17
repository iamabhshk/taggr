import api from './api';
import type { Label, CreateLabelInput, UpdateLabelInput, SearchParams } from '@/types';

export const labelService = {
  // Get all labels with search/filter
  getLabels: async (params?: SearchParams) => {
    return api.get<{
      labels: Label[];
      total: number;
      page: number;
      totalPages: number;
    }>('/labels', params);
  },

  // Get single label by ID
  getLabel: async (id: string) => {
    return api.get<{ label: Label }>(`/labels/${id}`);
  },

  // Create new label
  createLabel: async (data: CreateLabelInput) => {
    return api.post<{ label: Label }>('/labels', data);
  },

  // Update label
  updateLabel: async (id: string, data: UpdateLabelInput) => {
    return api.patch<{ label: Label }>(`/labels/${id}`, data);
  },

  // Delete label
  deleteLabel: async (id: string) => {
    return api.delete(`/labels/${id}`);
  },

  // Publish label
  publishLabel: async (id: string, changelog?: string, versionBump?: 'major' | 'minor' | 'patch') => {
    return api.post<{ label: Label }>(`/labels/${id}/publish`, {
      changelog,
      versionBump,
    });
  },

  // Get version history
  getVersionHistory: async (id: string) => {
    return api.get<{ versions: any[] }>(`/labels/${id}/versions`);
  },

  // Search labels
  searchLabels: async (params: SearchParams) => {
    return api.get<{
      labels: Label[];
      total: number;
      page: number;
      totalPages: number;
    }>('/labels/search', params);
  },

  // Export labels
  exportLabels: async () => {
    return api.post<{ labels: Label[]; count: number }>('/labels/bulk/export');
  },

  // Import labels
  importLabels: async (labels: any[]) => {
    return api.post<{ imported: number; failed: number }>('/labels/bulk/import', { labels });
  },

  // Get label stats
  getLabelStats: async () => {
    return api.get<{
      stats: {
        totalLabels: number;
        publishedLabels: number;
        totalDownloads: number;
        totalUsage: number;
        averageUsage: number;
        growth: {
          labels: number;
          usage: number;
          averageUsage: number;
          published: number;
        };
      };
    }>('/labels/stats');
  },
};

export default labelService;
