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
 * Validate API URL format
 */
function validateApiUrl(url: string): void {
  if (!url || typeof url !== 'string') {
    throw new Error('API URL must be a non-empty string');
  }
  
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('API URL must use http or https protocol');
    }
  } catch (error: any) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid API URL format: ${url}. Please provide a valid URL (e.g., https://api.example.com/api)`);
    }
    throw error;
  }
}

/**
 * Initialize the API client with config
 */
export function initApi(config: TaggrConfig): void {
  // Validate API URL
  validateApiUrl(config.apiUrl);
  
  // Validate API key
  if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
    throw new Error('API key must be a non-empty string');
  }
  
  apiClient = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'X-API-Key': config.apiKey.trim(),
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
      // Check if we got HTML (frontend) instead of JSON (backend)
      const responseData = error.response.data;
      if (typeof responseData === 'string' && (responseData.trim().startsWith('<!doctype') || responseData.trim().startsWith('<!DOCTYPE') || responseData.trim().startsWith('<html'))) {
        throw new Error(
          'Received HTML response instead of JSON. The API URL is pointing to the frontend.\n' +
          'Please ensure:\n' +
          '  1. Your backend is deployed and accessible\n' +
          '  2. Use the --url flag to specify the correct backend API URL\n' +
          '  3. Example: taggr login <API_KEY> --url https://your-backend-url.com/api'
        );
      }
      
      const data = responseData as ApiResponse<unknown>;
      if (data && typeof data === 'object' && 'error' in data && data.error) {
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
 * Check if response is HTML (indicates wrong URL - hitting frontend instead of backend)
 */
function checkForHtmlResponse(data: any, baseURL?: string): void {
  if (typeof data === 'string' && (data.trim().startsWith('<!doctype') || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html'))) {
    throw new Error(
      'Received HTML response instead of JSON. This usually means:\n' +
      '  1. The API URL is pointing to the frontend instead of the backend\n' +
      '  2. The backend is not deployed or is at a different URL\n' +
      '  3. Please check your backend deployment URL and use --url flag if needed\n' +
      `  Current URL: ${baseURL || apiClient?.defaults.baseURL || 'unknown'}`
    );
  }
}

/**
 * Get current user info
 */
export async function whoami(): Promise<WhoamiResponse> {
  try {
    const client = getClient();
    const response = await client.get<ApiResponse<WhoamiResponse>>('/cli/whoami');
    
    // Check if we got HTML instead of JSON (wrong URL)
    checkForHtmlResponse(response.data, client.defaults.baseURL);
    
    // Check if response has the expected structure
    if (!response.data) {
      throw new Error(`Invalid API response: response.data is ${typeof response.data}`);
    }
    
    // The API returns { success: true, data: { user: {...} } }
    // So response.data is the ApiResponse, and response.data.data is the WhoamiResponse
    const data = response.data.data;
    
    if (!data) {
      throw new Error(`Invalid API response: response.data.data is ${typeof data}. Full response: ${JSON.stringify(response.data)}`);
    }
    
    // Ensure the data has a user property
    if (!data.user) {
      throw new Error(`API response missing user property. Response data: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    // handleError always throws, so this will never return normally
    return handleError(error);
  }
}

/**
 * Get all labels for the user
 */
export async function getLabels(): Promise<LabelsResponse> {
  try {
    const client = getClient();
    const response = await client.get<ApiResponse<LabelsResponse>>('/cli/labels');
    
    // Check if we got HTML instead of JSON (wrong URL)
    checkForHtmlResponse(response.data, client.defaults.baseURL);
    
    // Check if response has the expected structure
    if (!response.data) {
      throw new Error(`Invalid API response: response.data is ${typeof response.data}`);
    }
    
    const data = response.data.data;
    
    if (!data) {
      throw new Error(`Invalid API response: response.data.data is ${typeof data}. Full response: ${JSON.stringify(response.data)}`);
    }
    
    // Ensure the data has labels and count properties
    if (!data.labels || !Array.isArray(data.labels)) {
      throw new Error(`API response missing labels array. Response data: ${JSON.stringify(data)}`);
    }
    
    if (typeof data.count !== 'number') {
      throw new Error(`API response missing count. Response data: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Get a single label by name
 */
export async function getLabelByName(name: string): Promise<LabelResponse> {
  try {
    const client = getClient();
    const response = await client.get<ApiResponse<LabelResponse>>(`/cli/labels/${name}`);
    
    // Check if we got HTML instead of JSON (wrong URL)
    checkForHtmlResponse(response.data, client.defaults.baseURL);
    
    // Check if response has the expected structure
    if (!response.data) {
      throw new Error(`Invalid API response: response.data is ${typeof response.data}`);
    }
    
    const data = response.data.data;
    
    if (!data) {
      throw new Error(`Invalid API response: response.data.data is ${typeof data}. Full response: ${JSON.stringify(response.data)}`);
    }
    
    // Ensure the data has a label property
    if (!data.label) {
      throw new Error(`API response missing label property. Response data: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Get label versions for checking if local labels are up-to-date
 * This endpoint should return current versions of all labels
 */
export async function getLabelVersions(): Promise<Record<string, string>> {
  try {
    const client = getClient();
    // For now, we'll use the labels endpoint and extract versions
    // In the future, this could be a dedicated endpoint: /cli/labels/versions
    const response = await getLabels();
    
    const versions: Record<string, string> = {};
    for (const label of response.labels) {
      versions[label.name] = label.version;
    }
    
    return versions;
  } catch (error) {
    return handleError(error);
  }
}

