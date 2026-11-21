import type { NextFunction, Request, Response } from 'express';
import { MAX_PAYLOAD_CHARS, measurePayloadSize } from '../utils/sanitize.ts';

export const HARDENED_CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  'frame-ancestors *',
].join('; ');

export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', HARDENED_CSP_POLICY);
  next();
}

export function apiNoStoreMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

export function payloadLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const size = measurePayloadSize(req.body);
    if (size > MAX_PAYLOAD_CHARS) {
      res.status(400).json({
        error: `Request payload exceeds the ${MAX_PAYLOAD_CHARS}-character limit.`,
        code: 'PAYLOAD_TOO_LARGE',
      });
      return;
    }
  }
  next();
}
