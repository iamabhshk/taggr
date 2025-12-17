import api from './api';

export interface Token {
  _id: string;
  name: string;
  scopes: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  keyPreview?: string;
}

export interface GenerateTokenResponse {
  apiKey: {
    _id: string;
    key: string;
    name: string;
    scopes: string[];
    isActive: boolean;
    createdAt: string;
  };
}

export const tokenService = {
  // Generate a new token
  generateToken: async (name: string, scopes?: string[]) => {
    return api.post<GenerateTokenResponse>('/api-keys', { name, scopes });
  },

  // List all tokens for current user
  listTokens: async () => {
    return api.get<{ apiKeys: Token[]; total: number }>('/api-keys');
  },

  // Revoke a token
  revokeToken: async (id: string) => {
    return api.delete(`/api-keys/${id}`);
  },

  // Regenerate a token
  regenerateToken: async (id: string) => {
    return api.post<GenerateTokenResponse>(`/api-keys/${id}/regenerate`);
  },
};

export default tokenService;

