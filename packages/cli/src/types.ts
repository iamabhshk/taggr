export interface TaggrConfig {
  apiKey: string;
  apiUrl: string;
}

export interface Label {
  name: string;
  displayName: string;
  value: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  isPublished: boolean;
  packageName: string;
}

export interface UserInfo {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  stats: {
    totalLabels: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface LabelsResponse {
  labels: Label[];
  count: number;
}

export interface LabelResponse {
  label: Label;
}

export interface WhoamiResponse {
  user: UserInfo;
}

export interface LabelMetadata {
  version: string;
  syncedAt: string;
  checksum: string;
}

export interface TaggrMetadata {
  syncedAt: string;
  apiUrl: string;
  labels: Record<string, LabelMetadata>;
  overallChecksum: string;
}

