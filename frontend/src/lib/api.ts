'use client';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://coreinventory-rwe1.onrender.com').replace(/\/$/, '');

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const getAuthHeaders = (headers: HeadersInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const readApiResponse = async <T>(res: Response): Promise<T> => {
  let payload: any;
  const contentType = res.headers.get('content-type') || '';
  
  try {
    payload = contentType.includes('application/json') ? await res.json() : await res.text();
  } catch (e) {
    payload = `Could not parse response (${res.status})`;
  }

  if (!res.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String(payload.message || `Request failed (${res.status})`)
      : typeof payload === 'string' ? payload : `Request failed (${res.status})`;

    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
};

export interface RequestOptions extends RequestInit {
  body?: any;
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, headers, ...rest } = options;
  
  const finalOptions: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': body instanceof FormData ? undefined : 'application/json',
      ...getAuthHeaders(headers),
    } as HeadersInit,
  };

  if (body) {
    finalOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const res = await fetch(apiUrl(path), finalOptions);
  return readApiResponse<T>(res);
};
