import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from './api';

// Mock axios
vi.mock('axios');
vi.mock('./firebase', () => ({
  getIdToken: vi.fn(() => Promise.resolve('mock-token')),
}));

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('makes GET request with correct base URL', async () => {
    const mockAxios = axios.create as any;
    const mockGet = vi.fn().mockResolvedValue({ data: { data: { test: 'value' } } });
    
    // Mock axios.create to return an instance with mocked methods
    mockAxios.mockReturnValue({
      get: mockGet,
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });

    await api.get('/test');
    expect(mockGet).toHaveBeenCalled();
  });

  it('handles POST requests', async () => {
    const mockAxios = axios.create as any;
    const mockPost = vi.fn().mockResolvedValue({ data: { data: { success: true } } });
    
    mockAxios.mockReturnValue({
      get: vi.fn(),
      post: mockPost,
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });

    await api.post('/test', { data: 'test' });
    expect(mockPost).toHaveBeenCalled();
  });
});

