import axios, { AxiosInstance, AxiosError } from 'axios';
import type { 
  ApiResponse, 
  LabelsResponse, 
  LabelResponse, 
  WhoamiResponse,
  TaggrConfig 
} from '../types.js';

let apiClient: AxiosInstance | null = null;

/**
 * Initialize the API client with config
 */
export function initApi(config: TaggrConfig): void {
  apiClient = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'X-API-Key': config.apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

/**
 * Get the API client (throws if not initialized)
 */
function getClient(): AxiosInstance {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initApi first.');
  }
  return apiClient;
}

/**
 * Handle API errors
 */
function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as ApiResponse<unknown>;
      if (data.error) {
        throw new Error(data.error.message);
      }
      throw new Error(`API error: ${error.response.status}`);
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Cannot connect to Taggr API. Please check:\n  1. The API URL is correct (use --url flag if needed)\n  2. You have an internet connection\n  3. The server is running and accessible');
    }
    throw new Error(`Network error: ${error.message}`);
  }
  throw error;
}

/**
 * Get current user info
 */
export async function whoami(): Promise<WhoamiResponse> {
  try {
    const response = await getClient().get<ApiResponse<WhoamiResponse>>('/cli/whoami');
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get all labels for the user
 */
export async function getLabels(): Promise<LabelsResponse> {
  try {
    const response = await getClient().get<ApiResponse<LabelsResponse>>('/cli/labels');
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get a single label by name
 */
export async function getLabelByName(name: string): Promise<LabelResponse> {
  try {
    const response = await getClient().get<ApiResponse<LabelResponse>>(`/cli/labels/${name}`);
    return response.data.data;
  } catch (error) {
    handleError(error);
  }
}

