import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export interface Label {
  _id: string;
  userId: string;
  name: string;
  displayName: string;
  value: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  isPublished: boolean;
  isPrivate: boolean;
  packageName: string;
  npmPackageId?: string;
  metadata: {
    downloads: number;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  versions: VersionEntry[];
}

export interface VersionEntry {
  version: string;
  value: string;
  changelog: string;
  publishedAt: Date;
}

export interface User {
  _id: string;
  uid: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalLabels: number;
    totalDownloads: number;
    lastActiveAt: Date;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    publicProfile: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    version?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query?: string;
  category?: string;
  tags?: string[];
}
