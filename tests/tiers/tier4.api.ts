import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import type { Server } from 'node:http';
import { createApp } from '../../server/app.ts';
import { ResourceRepository } from '../../server/repositories/resourceRepository.ts';
import { MemoryStorageAdapter } from '../../server/repositories/storageAdapter.ts';

describe('Tier 4 — Express API Routes, Headers & Offline Fallback', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const repo = new ResourceRepository(new MemoryStorageAdapter());
    const app = createApp({ repository: repo, apiKeyOverride: '' });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('returns healthy status with iframe-safe security headers and no-store cache', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-frame-options'), null);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('content-security-policy')?.includes('frame-ancestors *'));
    assert.ok(res.headers.get('cache-control')?.includes('no-store'));
  });

  it('serves all 3 pre-configured domain verticals', async () => {
    const res = await fetch(`${baseUrl}/api/verticals`);
    const body = (await res.json()) as { verticals: { id: string }[] };
    assert.equal(res.status, 200);
    assert.equal(body.verticals.length, 3);
    assert.deepEqual(
      body.verticals.map((v) => v.id),
      ['family', 'community', 'workplace']
    );
  });

  it('supports full RESTful CRUD on /api/resources with sanitization', async () => {
    const createRes = await fetch(`${baseUrl}/api/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    });
    assert.equal(createRes.status, 201);
    const created = (await createRes.json()) as { resource: { id: string; title: string; completed: boolean } };
    assert.equal(created.resource.title, 'EV Commuter Pool');

    const updateRes = await fetch(`${baseUrl}/api/resources/${created.resource.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    assert.equal(updateRes.status, 200);
    const updated = (await updateRes.json()) as { resource: { completed: boolean } };
    assert.equal(updated.resource.completed, true);

    const delRes = await fetch(`${baseUrl}/api/resources/${created.resource.id}`, {
      method: 'DELETE',
    });
    assert.equal(delRes.status, 200);
  });

  it('returns intelligent heuristic fallback on /api/advisor/plan when API key is missing (never 500)', async () => {
    const res = await fetch(`${baseUrl}/api/advisor/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verticalId: 'family',
        city: 'Lahore',
        aqi: 295,
        pm25: 215,
        lifestyle: 'Family of 4 with school-age children and gas kitchen',
        householdNotes: 'No central HVAC',
        focusArea: 'all',
      }),
    });
    assert.equal(res.status, 200);
    const plan = (await res.json()) as {
      mode: string;
      recommendations: unknown[];
      projectedPm25DropPct: number;
    };
    assert.equal(plan.mode, 'fallback');
    assert.ok(plan.recommendations.length >= 3);
    assert.ok(plan.projectedPm25DropPct > 0);
  });

  it('rejects oversized >3000 char payloads with HTTP 400', async () => {
    const res = await fetch(`${baseUrl}/api/advisor/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verticalId: 'family',
        city: 'Delhi',
        lifestyle: 'a'.repeat(3200),
      }),
    });
    assert.equal(res.status, 400);
  });

  it('returns 404 when updating or deleting a non-existent resource', async () => {
    const res = await fetch(`${baseUrl}/api/resources/missing-id-999`, { method: 'DELETE' });
    assert.equal(res.status, 404);
  });
});
