import { calculateAggregateImpact } from '../../shared/airMath.ts';
import type {
  ActionResource,
  CreateResourceInput,
  ResourceCategory,
  ResourcePriority,
  UpdateResourceInput,
  VerticalId,
} from '../../shared/types.ts';
import type { ResourceRepository } from '../repositories/resourceRepository.ts';
import { clampNumber, sanitizeText, ValidationError } from '../utils/sanitize.ts';

const VALID_VERTICALS: VerticalId[] = ['family', 'community', 'workplace'];
const VALID_CATEGORIES: ResourceCategory[] = ['routine', 'indoor-hack', 'sustainable-alt'];
const VALID_PRIORITIES: ResourcePriority[] = ['High', 'Medium', 'Low'];

export function assertVerticalId(value: unknown): VerticalId {
  if (typeof value === 'string' && VALID_VERTICALS.includes(value as VerticalId)) {
    return value as VerticalId;
  }
  throw new ValidationError('verticalId must be family, community, or workplace.');
}

function parseCategory(value: unknown): ResourceCategory {
  if (typeof value === 'string' && VALID_CATEGORIES.includes(value as ResourceCategory)) {
    return value as ResourceCategory;
  }
  throw new ValidationError('category must be routine, indoor-hack, or sustainable-alt.');
}

function parsePriority(value: unknown): ResourcePriority {
  if (typeof value === 'string' && VALID_PRIORITIES.includes(value as ResourcePriority)) {
    return value as ResourcePriority;
  }
  return 'Medium';
}

export class ResourceService {
  private readonly repo: ResourceRepository;

  constructor(repo: ResourceRepository) {
    this.repo = repo;
  }

  listResources(verticalQuery?: unknown): {
    resources: ActionResource[];
    impact: ReturnType<typeof calculateAggregateImpact>;
  } {
    const verticalId =
      typeof verticalQuery === 'string' && verticalQuery.length > 0
        ? assertVerticalId(verticalQuery)
        : undefined;
    const resources = this.repo.list(verticalId);
    return { resources, impact: calculateAggregateImpact(resources) };
  }

  createResource(raw: Record<string, unknown>): ActionResource {
    const input: CreateResourceInput = {
      verticalId: assertVerticalId(raw.verticalId),
      title: sanitizeText(raw.title, 'title', 120, true),
      category: parseCategory(raw.category),
      priority: parsePriority(raw.priority),
      timeWindow: sanitizeText(raw.timeWindow, 'timeWindow', 60, true),
      description: sanitizeText(raw.description, 'description', 600, true),
      impactSummary: sanitizeText(raw.impactSummary, 'impactSummary', 300, true),
      pm25ReductionPct: clampNumber(raw.pm25ReductionPct, 0, 80, 20),
      co2SavedKgPerMonth: clampNumber(raw.co2SavedKgPerMonth, 0, 2000, 10),
      costEstimate: sanitizeText(raw.costEstimate ?? '$0', 'costEstimate', 48, false) || '$0',
      source: raw.source === 'ai' || raw.source === 'preset' ? raw.source : 'user',
    };
    return this.repo.create(input);
  }

  updateResource(id: string, raw: Record<string, unknown>): ActionResource {
    const cleanId = sanitizeText(id, 'id', 64, true);
    const patch: UpdateResourceInput = {};

    if (raw.title !== undefined) patch.title = sanitizeText(raw.title, 'title', 120, true);
    if (raw.category !== undefined) patch.category = parseCategory(raw.category);
    if (raw.priority !== undefined) patch.priority = parsePriority(raw.priority);
    if (raw.timeWindow !== undefined) patch.timeWindow = sanitizeText(raw.timeWindow, 'timeWindow', 60, true);
    if (raw.description !== undefined) patch.description = sanitizeText(raw.description, 'description', 600, true);
    if (raw.impactSummary !== undefined) patch.impactSummary = sanitizeText(raw.impactSummary, 'impactSummary', 300, true);
    if (raw.pm25ReductionPct !== undefined) patch.pm25ReductionPct = clampNumber(raw.pm25ReductionPct, 0, 80, 20);
    if (raw.co2SavedKgPerMonth !== undefined) patch.co2SavedKgPerMonth = clampNumber(raw.co2SavedKgPerMonth, 0, 2000, 10);
    if (raw.costEstimate !== undefined) patch.costEstimate = sanitizeText(raw.costEstimate, 'costEstimate', 48, false) || '$0';
    if (typeof raw.completed === 'boolean') patch.completed = raw.completed;

    const updated = this.repo.update(cleanId, patch);
    if (!updated) {
      throw new ValidationError('Resource not found.', 404);
    }
    return updated;
  }

  deleteResource(id: string): void {
    const cleanId = sanitizeText(id, 'id', 64, true);
    const removed = this.repo.remove(cleanId);
    if (!removed) {
      throw new ValidationError('Resource not found.', 404);
    }
  }
}
