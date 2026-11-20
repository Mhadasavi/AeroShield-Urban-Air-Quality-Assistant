import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Request, Response } from 'express';
import { createApiController } from '../../server/controllers/apiController.ts';
import {
  apiNoStoreMiddleware,
  payloadLimitMiddleware,
  securityHeadersMiddleware,
} from '../../server/middleware/security.ts';
import { ResourceRepository } from '../../server/repositories/resourceRepository.ts';
import { MemoryStorageAdapter } from '../../server/repositories/storageAdapter.ts';
import { ResourceService } from '../../server/services/resourceService.ts';

interface MockResponseState {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}

function invokePipeline(
  method: string,
  opts: { body?: unknown; params?: Record<string, string>; query?: Record<string, string> },
  handler: (req: Request, res: Response) => void | Promise<void>
): Promise<MockResponseState> {
  return new Promise((resolve, reject) => {
    const state: MockResponseState = { statusCode: 200, headers: {}, body: null };
    const req = {
      method,
      body: opts.body ?? {},
      params: opts.params ?? {},
      query: opts.query ?? {},
    } as unknown as Request;

    const res = {
      removeHeader(name: string) {
        delete state.headers[name.toLowerCase()];
      },
      setHeader(name: string, val: string) {
        state.headers[name.toLowerCase()] = val;
      },
      status(code: number) {
        state.statusCode = code;
        return res;
      },
      json(payload: unknown) {
        state.body = payload;
        resolve(state);
        return res;
      },
    } as unknown as Response;

    securityHeadersMiddleware(req, res, () => {
      apiNoStoreMiddleware(req, res, () => {
        payloadLimitMiddleware(req, res, () => {
          Promise.resolve(handler(req, res)).catch(reject);
        });
      });
    });
  });
}

describe('Tier 4 — Express API Controllers, Security Middleware & Offline Fallback', () => {
  const repo = new ResourceRepository(new MemoryStorageAdapter());
  const service = new ResourceService(repo);
  const controller = createApiController(service, '');

  it('returns healthy status with iframe-safe security and no-store cache headers', async () => {
    const res = await invokePipeline('GET', {}, controller.getHealth);
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['x-frame-options'], undefined);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.ok(res.headers['content-security-policy']?.includes('frame-ancestors *'));
    assert.ok(res.headers['cache-control']?.includes('no-store'));
    assert.equal((res.body as { status: string }).status, 'ok');
  });

  it('serves all 3 pre-configured domain verticals', async () => {
    const res = await invokePipeline('GET', {}, controller.getVerticals);
    const body = res.body as { verticals: { id: string }[] };
    assert.equal(res.statusCode, 200);
    assert.equal(body.verticals.length, 3);
    assert.deepEqual(
      body.verticals.map((v) => v.id),
      ['family', 'community', 'workplace']
    );
  });

  it('lists resources filtered by verticalId along with aggregate impact math', async () => {
    const res = await invokePipeline(
      'GET',
      { query: { verticalId: 'community' } },
      controller.listResources
    );
    const body = res.body as { resources: { verticalId: string }[]; impact: { totalCount: number } };
    assert.equal(res.statusCode, 200);
    assert.ok(body.resources.length >= 3);
    assert.ok(body.resources.every((r) => r.verticalId === 'community'));
    assert.equal(body.impact.totalCount, body.resources.length);
  });

  it('supports full RESTful CRUD on /api/resources with script sanitization', async () => {
    const created = await invokePipeline(
      'POST',
      {
        body: {
          verticalId: 'workplace',
          title: '<script>alert(1)</script>EV Commuter Pool',
          category: 'sustainable-alt',
          priority: 'High',
          timeWindow: 'Weekdays',
          description: 'Coordinate shared EV shuttles for studio staff.',
          impactSummary: 'Cuts office commuting PM2.5 and saves 180 kg CO2/mo.',
          pm25ReductionPct: 24,
          co2SavedKgPerMonth: 180,
          costEstimate: '$0',
        },
      },
      controller.createResource
    );
    assert.equal(created.statusCode, 201);
    const record = (created.body as { resource: { id: string; title: string } }).resource;
    assert.equal(record.title, 'EV Commuter Pool');

    const updated = await invokePipeline(
      'PUT',
      { params: { id: record.id }, body: { completed: true } },
      controller.updateResource
    );
    assert.equal(updated.statusCode, 200);
    assert.equal((updated.body as { resource: { completed: boolean } }).resource.completed, true);

    const deleted = await invokePipeline(
      'DELETE',
      { params: { id: record.id } },
      controller.deleteResource
    );
    assert.equal(deleted.statusCode, 200);
    assert.equal((deleted.body as { deleted: boolean }).deleted, true);
  });

  it('returns intelligent heuristic fallback on /api/advisor/plan when API key is missing (never 500)', async () => {
    const res = await invokePipeline(
      'POST',
      {
        body: {
          verticalId: 'family',
          city: 'Lahore',
          aqi: 295,
          pm25: 215,
          lifestyle: 'Family of 4 with school-age children and gas kitchen',
          householdNotes: 'No central HVAC',
          focusArea: 'all',
        },
      },
      controller.postAdvisorPlan
    );
    assert.equal(res.statusCode, 200);
    const plan = res.body as {
      mode: string;
      recommendations: unknown[];
      projectedPm25DropPct: number;
    };
    assert.equal(plan.mode, 'fallback');
    assert.ok(plan.recommendations.length >= 3);
    assert.ok(plan.projectedPm25DropPct > 0);
  });

  it('rejects oversized >3000 char payloads with HTTP 400 before controller execution', async () => {
    const res = await invokePipeline(
      'POST',
      {
        body: {
          verticalId: 'family',
          city: 'Delhi',
          lifestyle: 'a'.repeat(3200),
        },
      },
      controller.postAdvisorPlan
    );
    assert.equal(res.statusCode, 400);
    assert.equal((res.body as { code: string }).code, 'PAYLOAD_TOO_LARGE');
  });

  it('returns 404 when deleting a non-existent resource', async () => {
    const res = await invokePipeline(
      'DELETE',
      { params: { id: 'missing-id-999' } },
      controller.deleteResource
    );
    assert.equal(res.statusCode, 404);
  });
});
