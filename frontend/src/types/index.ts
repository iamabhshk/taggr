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
    createdAt: string;
    updatedAt: string;
  };
  versions: VersionEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface VersionEntry {
  version: string;
  value: string;
  changelog: string;
  publishedAt: string;
}

export interface User {
  uid: string;
  email: string;
  username?: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalLabels: number;
    totalDownloads: number;
    lastActiveAt: string;
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
    pagination?: {
      page: number;
      totalPages: number;
      total: number;
    };
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export interface CreateLabelInput {
  name: string;
  displayName: string;
  value: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateLabelInput {
  displayName?: string;
  value?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}
