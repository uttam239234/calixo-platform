/**
 * Calixo Platform - API Client Foundation
 * 
 * Core HTTP client with interceptors, retry strategy, timeout handling,
 * request cancellation, and error mapping.
 * 
 * NOTE: This is the foundation. No external APIs are connected yet.
 */

import { API } from '@/config';
import { AppError, ApiError, NetworkError, AuthenticationError, PermissionError, NotFoundError, RateLimitError, ValidationError } from '@/errors';
import { appLogger } from '@/logging';

// ============================================================================
// Types
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: RetryConfig;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob' | 'text';
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  maxDelay: number;
  shouldRetry?: (error: unknown) => boolean;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: string;
}

export interface RequestInterceptor {
  onRequest: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
}

export interface ResponseInterceptor {
  onResponse: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError: (error: unknown) => unknown;
}

export interface ApiClientConfig {
  baseUrl: string;
  defaultTimeout: number;
  defaultRetry: RetryConfig;
  defaultHeaders: Record<string, string>;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: API.BASE_URL,
  defaultTimeout: API.TIMEOUT,
  defaultRetry: {
    attempts: API.RETRY_ATTEMPTS,
    delay: API.RETRY_DELAY,
    maxDelay: API.MAX_RETRY_DELAY,
    shouldRetry: (error) => {
      if (error instanceof NetworkError) return true;
      if (error instanceof RateLimitError) return true;
      if (error instanceof ApiError && error.statusCode >= 500) return true;
      return false;
    },
  },
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// ============================================================================
// API Client Class
// ============================================================================

export class ApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private activeRequests: Map<string, AbortController> = new Map();

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================================
  // Interceptors
  // ============================================================================

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index >= 0) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index >= 0) this.responseInterceptors.splice(index, 1);
    };
  }

  // ============================================================================
  // Request Cancellation
  // ============================================================================

  cancelRequest(key: string): void {
    const controller = this.activeRequests.get(key);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(key);
    }
  }

  cancelAllRequests(): void {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }

  // ============================================================================
  // Core Request Method
  // ============================================================================

  async request<T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const requestId = `${config.method}-${config.url}-${Date.now()}`;

    // Apply request interceptors
    let processedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await Promise.resolve(interceptor.onRequest(processedConfig));
    }

    // Build URL
    const url = new URL(processedConfig.url, this.config.baseUrl);
    if (processedConfig.params) {
      Object.entries(processedConfig.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    // Setup abort controller
    const controller = new AbortController();
    this.activeRequests.set(requestId, controller);

    const timeout = processedConfig.timeout || this.config.defaultTimeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge headers
    const headers = {
      ...this.config.defaultHeaders,
      ...processedConfig.headers,
    };

    // Build fetch options
    const fetchOptions: RequestInit = {
      method: processedConfig.method,
      headers,
      signal: processedConfig.signal || controller.signal,
    };

    if (processedConfig.data && processedConfig.method !== 'GET') {
      fetchOptions.body = JSON.stringify(processedConfig.data);
    }

    // Execute with retry
    const retryConfig = processedConfig.retry || this.config.defaultRetry;
    let lastError: unknown;
    let attempt = 0;

    while (attempt <= retryConfig.attempts) {
      try {
        const response = await fetch(url.toString(), fetchOptions);
        clearTimeout(timeoutId);
        this.activeRequests.delete(requestId);

        const responseData = await this.parseResponse<T>(response);
        const apiResponse: ApiResponse<T> = {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString(),
        };

        // Apply response interceptors
        let processedResponse = apiResponse;
        for (const interceptor of this.responseInterceptors) {
          processedResponse = await Promise.resolve(interceptor.onResponse(processedResponse));
        }

        const duration = performance.now() - startTime;
        appLogger.debug('ApiClient', `${config.method} ${config.url} - ${response.status} (${duration.toFixed(0)}ms)`);

        return processedResponse;
      } catch (error) {
        clearTimeout(timeoutId);
        this.activeRequests.delete(requestId);
        lastError = this.mapError(error);

        // Check if we should retry
        if (attempt < retryConfig.attempts && retryConfig.shouldRetry?.(lastError)) {
          const delay = Math.min(retryConfig.delay * 2 ** attempt, retryConfig.maxDelay);
          appLogger.warn('ApiClient', `Retrying ${config.method} ${config.url} (attempt ${attempt + 1}/${retryConfig.attempts})`, { delay });
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
          continue;
        }

        // Apply error interceptors
        for (const interceptor of this.responseInterceptors) {
          lastError = interceptor.onError(lastError);
        }

        throw lastError;
      }
    }

    // Exhausted all retries - this should never be reached as the loop always generates a throw or return
    throw lastError || new NetworkError('Request failed after exhausting retries');
  }

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  async get<T = unknown>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = unknown>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = unknown>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = unknown>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    if (contentType.includes('text/')) {
      return response.text() as unknown as T;
    }
    return response.blob() as unknown as T;
  }

  private mapError(error: unknown): unknown {
    if (error instanceof AppError) return error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      return new NetworkError('Request was cancelled');
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return new NetworkError('Network request failed');
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return new NetworkError('Request timed out');
    }

    if (error instanceof Response) {
      return this.mapResponseError(error);
    }

    return error;
  }

  private async mapResponseError(response: Response): Promise<AppError> {
    let body: { message?: string; code?: string; errors?: Record<string, string[]> } = {};
    try {
      body = await response.json();
    } catch {
      // Ignore parse errors
    }

    const message = body.message || `Request failed with status ${response.status}`;

    switch (response.status) {
      case 400:
        return new ValidationError(message, body.errors || {});
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new PermissionError(message);
      case 404:
        return new NotFoundError();
      case 429:
        return new RateLimitError();
      default:
        return new ApiError(message, body.code || 'API_ERROR', response.status);
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const apiClient = new ApiClient();
export default apiClient;