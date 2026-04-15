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
  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload
      ? String((payload as { message?: unknown }).message || `Request failed (${res.status})`)
      : `Request failed (${res.status})`;

    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
};
