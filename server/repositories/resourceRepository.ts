import crypto from 'crypto';
import type {
  ActionResource,
  CreateResourceInput,
  UpdateResourceInput,
  VerticalId,
} from '../../shared/types.ts';
import { INITIAL_RESOURCES } from '../data/resourcesSeed.ts';
import type { StorageAdapter } from './storageAdapter.ts';

export interface PersistedStore {
  resources: ActionResource[];
}

export class ResourceRepository {
  private readonly adapter: StorageAdapter<PersistedStore>;

  constructor(adapter: StorageAdapter<PersistedStore>) {
    this.adapter = adapter;
    const existing = this.adapter.read();
    if (!existing || !Array.isArray(existing.resources)) {
      this.adapter.write({ resources: structuredClone(INITIAL_RESOURCES) });
    }
  }

  private readAll(): ActionResource[] {
    const data = this.adapter.read();
    return data?.resources ? structuredClone(data.resources) : [];
  }

  private writeAll(resources: ActionResource[]): void {
    this.adapter.write({ resources });
  }

  list(verticalId?: VerticalId): ActionResource[] {
    const all = this.readAll();
    const filtered = verticalId ? all.filter((item) => item.verticalId === verticalId) : all;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findById(id: string): ActionResource | null {
    return this.readAll().find((item) => item.id === id) ?? null;
  }

  create(input: CreateResourceInput): ActionResource {
    const now = new Date().toISOString();
    const record: ActionResource = {
      id: `res-${crypto.randomBytes(4).toString('hex')}`,
      verticalId: input.verticalId,
      title: input.title,
      category: input.category,
      priority: input.priority,
      timeWindow: input.timeWindow,
      description: input.description,
      impactSummary: input.impactSummary,
      pm25ReductionPct: input.pm25ReductionPct,
      co2SavedKgPerMonth: input.co2SavedKgPerMonth,
      costEstimate: input.costEstimate,
      completed: false,
      source: input.source ?? 'user',
      createdAt: now,
      updatedAt: now,
    };
    const all = this.readAll();
    all.unshift(record);
    this.writeAll(all);
    return record;
  }

  update(id: string, patch: UpdateResourceInput): ActionResource | null {
    const all = this.readAll();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    const updated: ActionResource = {
      ...all[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    this.writeAll(all);
    return updated;
  }

  remove(id: string): boolean {
    const all = this.readAll();
    const next = all.filter((item) => item.id !== id);
    if (next.length === all.length) return false;
    this.writeAll(next);
    return true;
  }

  resetToSeed(): ActionResource[] {
    const seed = structuredClone(INITIAL_RESOURCES);
    this.writeAll(seed);
    return seed;
  }
}
