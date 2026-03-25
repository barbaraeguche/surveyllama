import { logger } from './logger';

/**
 * Standard structure for API responses.
 */
export interface ApiResponse<T> {
  /** The data returned from the API, if successful. */
  data?: T;
  /** The error message, if the request failed. */
  error?: string;
}

/**
 * Generic function to perform API requests with logging and error handling.
 * @param url - The API endpoint URL.
 * @param options - Standard fetch options.
 * @returns A promise that resolves to an ApiResponse object.
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';
  logger.debug(`API Request: ${method} ${url}`, options.body);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      logger.warn('Unauthorized access detected, redirecting to login');
      // Optional: trigger logout or redirect
      return { error: 'Your session has expired. Please log in again.' };
    }

    const contentType = response.headers.get('content-type');
    let data: any = {};
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      logger.error(`Received non-JSON response from ${method} ${url}`, { status: response.status, body: text.substring(0, 100) });
      return { error: `Server returned an unexpected response (Status ${response.status})` };
    }

    if (!response.ok) {
      const errorMessage = data.error || `Request failed with status ${response.status}`;
      logger.error(`API Error: ${method} ${url}`, { status: response.status, error: errorMessage });
      return { error: errorMessage };
    }

    logger.debug(`API Success: ${method} ${url}`, data);
    return { data };
  } catch (error: any) {
    logger.error(`API Network Error: ${method} ${url}`, error);
    return { error: 'A network error occurred. Please check your connection.' };
  }
}
