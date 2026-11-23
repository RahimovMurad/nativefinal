import { API_CONFIG } from '@/config/apiConfig';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export async function httpRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeoutMs = API_CONFIG.timeoutMs,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = { ...headers };
  if (body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(
        `API xətası: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Sorğu vaxtı bitdi (Timeout)', 408);
    }
    throw new ApiError(
      'İnternet bağlantısı yoxdur və ya server əlçatan deyil.',
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
