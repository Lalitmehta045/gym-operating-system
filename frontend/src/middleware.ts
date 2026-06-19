import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Determine allowed origins for CSP
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  let apiOrigin = apiUrl;
  try {
    apiOrigin = new URL(apiUrl).origin;
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_API_URL");
  }
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Apply strict security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Build CSP directives
  // In development, we need 'unsafe-eval' for Next.js HMR/Fast Refresh
  const scriptSrc = isDevelopment 
    ? "'self' 'unsafe-eval' 'unsafe-inline'" 
    : "'self' 'unsafe-inline'"; // 'unsafe-inline' is often still needed for hydration scripts in Next.js

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://i.pravatar.cc", // Whitelist pravatar for testimonials
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin} ws://localhost:* wss://localhost:* http://localhost:*`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static assets, favicon, API, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
