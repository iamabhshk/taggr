import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/react';
import { getIdToken } from './firebase';
import type { ApiResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: InternalAxiosRequestConfig;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Force refresh the token
            const newToken = await getIdToken(true);

            if (newToken) {
              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Process all queued requests with new token
              this.processQueue(null, newToken);

              // Retry the original request
              return this.client(originalRequest);
            } else {
              // Token refresh failed, reject all queued requests
              this.processQueue(new Error('Token refresh failed'), null);
              throw new Error('Authentication failed. Please login again.');
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle network errors with retry logic
        if (!error.response && !originalRequest._retry) {
          originalRequest._retry = true;

          // Retry up to 3 times with exponential backoff
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              await this.delay(Math.pow(2, attempt) * 1000); // 2s, 4s, 8s
              return await this.client(originalRequest);
            } catch (retryError) {
              if (attempt === 3) {
                throw new Error('Network error. Please check your connection and try again.');
              }
            }
          }
        }

        // Handle API error responses
        if (error.response?.data?.error) {
          const apiError = new Error(error.response.data.error.message);
          
          // Log 5xx errors to Sentry
          if (error.response.status >= 500) {
            Sentry.captureException(apiError, {
              tags: {
                url: originalRequest.url,
                method: originalRequest.method,
                status: error.response.status,
              },
            });
          }
          
          throw apiError;
        }

        // Log network errors to Sentry
        if (!error.response) {
          Sentry.captureException(error, {
            tags: {
              url: originalRequest.url,
              method: originalRequest.method,
              type: 'network_error',
            },
          });
        }

        throw error;
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.config.headers.Authorization = `Bearer ${token}`;
        prom.resolve(this.client(prom.config));
      }
    });

    this.failedQueue = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data as T;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data as T;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data as T;
  }
}

export const api = new ApiClient();
export default api;
