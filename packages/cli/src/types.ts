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

