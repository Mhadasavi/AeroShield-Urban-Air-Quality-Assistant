export const MAX_PAYLOAD_CHARS = 3000;

export class ValidationError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

export function stripDangerousMarkup(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeText(value: unknown, fieldName: string, maxLen = 500, required = false): string {
  if (typeof value !== 'string') {
    if (required) {
      throw new ValidationError(`${fieldName} is required and must be text.`);
    }
    return '';
  }

  if (value.length > MAX_PAYLOAD_CHARS) {
    throw new ValidationError(`${fieldName} exceeds the ${MAX_PAYLOAD_CHARS}-character payload limit.`);
  }

  const cleaned = stripDangerousMarkup(value);
  if (required && cleaned.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty after sanitization.`);
  }

  return cleaned.slice(0, maxLen);
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

export function measurePayloadSize(body: unknown): number {
  if (body === null || body === undefined) return 0;
  if (typeof body === 'string') return body.length;
  try {
    return JSON.stringify(body).length;
  } catch {
    return MAX_PAYLOAD_CHARS + 1;
  }
}
