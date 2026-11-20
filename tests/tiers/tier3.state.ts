import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ResourceRepository } from '../../server/repositories/resourceRepository.ts';
import { MemoryStorageAdapter } from '../../server/repositories/storageAdapter.ts';
import { ResourceService } from '../../server/services/resourceService.ts';
import { ValidationError } from '../../server/utils/sanitize.ts';
import { appReducer, initialAppState } from '../../src/state/appReducer.ts';

describe('Tier 3 — State Isolation, Repository CRUD & Reducer Edge Cases', () => {
  it('isolates independent ResourceRepository instances via MemoryStorageAdapter', () => {
    const repoA = new ResourceRepository(new MemoryStorageAdapter());
    const repoB = new ResourceRepository(new MemoryStorageAdapter());

    const created = repoA.create({
      verticalId: 'family',
      title: 'Isolated Protocol A',
      category: 'routine',
      priority: 'High',
      timeWindow: '08:00',
      description: 'Test isolation',
      impactSummary: 'Lowers PM2.5',
      pm25ReductionPct: 20,
      co2SavedKgPerMonth: 15,
      costEstimate: '$0',
    });

    assert.ok(repoA.findById(created.id));
    assert.equal(repoB.findById(created.id), null);
  });

  it('supports full create, list-by-vertical, update, and delete lifecycle', () => {
    const repo = new ResourceRepository(new MemoryStorageAdapter());
    const service = new ResourceService(repo);

    const initialFamilyCount = service.listResources('family').resources.length;
    const item = service.createResource({
      verticalId: 'family',
      title: 'HEPA Entryway Curtain',
      category: 'indoor-hack',
      priority: 'High',
      timeWindow: 'Continuous',
      description: 'Install draft stopper and vestibule purifier.',
      impactSummary: 'Reduces tracked outdoor smoke by 35%.',
      pm25ReductionPct: 35,
      co2SavedKgPerMonth: 6,
      costEstimate: '$30',
    });

    assert.equal(service.listResources('family').resources.length, initialFamilyCount + 1);
    const updated = service.updateResource(item.id, { completed: true, pm25ReductionPct: 40 });
    assert.equal(updated.completed, true);
    assert.equal(updated.pm25ReductionPct, 40);

    service.deleteResource(item.id);
    assert.equal(repo.findById(item.id), null);
  });

  it('rejects invalid vertical IDs and missing record IDs with clean ValidationError', () => {
    const service = new ResourceService(new ResourceRepository(new MemoryStorageAdapter()));
    assert.throws(() => service.listResources('enterprise-unknown'), ValidationError);
    assert.throws(() => service.updateResource('non-existent-id', { completed: true }), ValidationError);
    assert.throws(() => service.deleteResource('non-existent-id'), ValidationError);
  });

  it('transitions centralized appReducer cleanly across modals, vertical switches, and filters', () => {
    let state = appReducer(initialAppState, { type: 'OPEN_CREATE_MODAL' });
    assert.equal(state.modal.type, 'create-resource');

    state = appReducer(state, { type: 'CLOSE_MODAL' });
    assert.equal(state.modal.type, 'closed');

    state = appReducer(state, { type: 'SET_CATEGORY_FILTER', filter: 'indoor-hack' });
    state = appReducer(state, { type: 'SET_SEARCH_QUERY', query: 'HEPA' });
    assert.equal(state.categoryFilter, 'indoor-hack');
    assert.equal(state.searchQuery, 'HEPA');

    state = appReducer(state, { type: 'SELECT_VERTICAL', verticalId: 'community' });
    assert.equal(state.activeVerticalId, 'community');
    assert.equal(state.categoryFilter, 'all');
    assert.equal(state.searchQuery, '');
  });

  it('preserves shield respirator overrides per member without mutating other state', () => {
    const next = appReducer(initialAppState, {
      type: 'SET_SHIELD_MASK',
      memberId: 'fam-1',
      maskGrade: 'P100',
    });
    assert.equal(next.shieldOverrides['fam-1'], 'P100');
    assert.equal(initialAppState.shieldOverrides['fam-1'], undefined);
  });

  it('sets and clears live toast notifications deterministically', () => {
    const withToast = appReducer(initialAppState, {
      type: 'SHOW_TOAST',
      text: 'Protocol saved',
      tone: 'success',
    });
    assert.equal(withToast.toast?.text, 'Protocol saved');
    const cleared = appReducer(withToast, { type: 'CLEAR_TOAST' });
    assert.equal(cleared.toast, null);
  });
});
