import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  clampNumber,
  MAX_PAYLOAD_CHARS,
  measurePayloadSize,
  sanitizeText,
  stripDangerousMarkup,
  ValidationError,
} from '../../server/utils/sanitize.ts';
import {
  apiNoStoreMiddleware,
  payloadLimitMiddleware,
  securityHeadersMiddleware,
} from '../../server/middleware/security.ts';
import type { Request, Response } from 'express';

function createMockRes() {
  const headers: Record<string, string> = { 'x-frame-options': 'SAMEORIGIN' };
  let statusCode = 200;
  let body: unknown;
  const res = {
    removeHeader(name: string) {
      delete headers[name.toLowerCase()];
    },
    setHeader(name: string, val: string) {
      headers[name.toLowerCase()] = val;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      body = payload;
      return res;
    },
  } as unknown as Response;
  return { res, headers, getStatus: () => statusCode, getBody: () => body };
}

describe('Tier 2 — Security Sanitization & iFrame-Compatible Headers', () => {
  it('strips inline script tags and nested malicious payloads completely', () => {
    const clean = stripDangerousMarkup('Hello <script>alert("xss")</script>World');
    assert.equal(clean, 'Hello World');
  });

  it('strips javascript URIs, style tags, and HTML event attributes', () => {
    const clean = stripDangerousMarkup(
      '<img src="x" onerror="steal()" />javascript:alert(1)<style>body{display:none}</style>Safe'
    );
    assert.equal(clean, 'alert(1)Safe');
    assert.ok(!clean.includes('<img'));
    assert.ok(!clean.includes('javascript:'));
  });

  it('enforces 3,000-character limit in sanitizeText', () => {
    const oversized = 'A'.repeat(MAX_PAYLOAD_CHARS + 1);
    assert.throws(() => sanitizeText(oversized, 'description', 500, true), ValidationError);
  });

  it('rejects empty required text after stripping script-only input', () => {
    assert.throws(
      () => sanitizeText('<script>evil()</script>', 'title', 120, true),
      ValidationError
    );
  });

  it('clamps numeric bounds and falls back on non-finite values', () => {
    assert.equal(clampNumber('999', 0, 100, 10), 100);
    assert.equal(clampNumber('-5', 0, 100, 10), 0);
    assert.equal(clampNumber('invalid', 0, 100, 42), 42);
  });

  it('mounts required security headers and removes X-Frame-Options for preview iframes', () => {
    const { res, headers } = createMockRes();
    let nextCalled = false;
    securityHeadersMiddleware({} as Request, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(headers['x-frame-options'], undefined);
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.ok(headers['content-security-policy']?.includes('frame-ancestors *'));
  });

  it('sets no-store cache headers on /api routes', () => {
    const { res, headers } = createMockRes();
    apiNoStoreMiddleware({} as Request, res, () => undefined);
    assert.ok(headers['cache-control']?.includes('no-store'));
    assert.ok(headers['cache-control']?.includes('no-cache'));
  });

  it('blocks POST payloads exceeding 3,000 characters in payloadLimitMiddleware', () => {
    const { res, getStatus, getBody } = createMockRes();
    let nextCalled = false;
    const req = {
      method: 'POST',
      body: { notes: 'x'.repeat(MAX_PAYLOAD_CHARS + 50) },
    } as unknown as Request;
    payloadLimitMiddleware(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false);
    assert.equal(getStatus(), 400);
    assert.equal((getBody() as { code: string }).code, 'PAYLOAD_TOO_LARGE');
    assert.ok(measurePayloadSize(req.body) > MAX_PAYLOAD_CHARS);
  });
});
