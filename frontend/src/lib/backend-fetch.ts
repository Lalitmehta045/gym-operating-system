import { NextRequest } from 'next/server';

export async function backendFetch(req: NextRequest, path: string, options: RequestInit = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${apiUrl}${path}`;
  
  const authHeader = req.headers.get('authorization');
  const cookieHeader = req.headers.get('cookie');
  
  const headers = new Headers(options.headers || {});
  
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }
  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = 'Failed to fetch from backend';
    try {
      const errorData = await res.json();
      message = errorData.message || errorData.error || message;
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    const error: any = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
