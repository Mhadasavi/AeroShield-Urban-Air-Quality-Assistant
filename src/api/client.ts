import type {
  ActionResource,
  AdvisorPlanResponse,
  AdvisorRequest,
  CreateResourceInput,
  DomainVertical,
  UpdateResourceInput,
  VerticalId,
} from '../../shared/types.ts';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export const apiClient = {
  fetchVerticals(): Promise<{ verticals: DomainVertical[] }> {
    return requestJson('/api/verticals');
  },

  fetchResources(verticalId?: VerticalId): Promise<{
    resources: ActionResource[];
    impact: {
      activeCount: number;
      totalCount: number;
      combinedPm25ReductionPct: number;
      monthlyCo2SavedKg: number;
      annualCo2SavedKg: number;
      equivalentTrees: number;
    };
  }> {
    const query = verticalId ? `?verticalId=${encodeURIComponent(verticalId)}` : '';
    return requestJson(`/api/resources${query}`);
  },

  createResource(input: CreateResourceInput): Promise<{ resource: ActionResource }> {
    return requestJson('/api/resources', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateResource(id: string, patch: UpdateResourceInput): Promise<{ resource: ActionResource }> {
    return requestJson(`/api/resources/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
  },

  deleteResource(id: string): Promise<{ deleted: boolean }> {
    return requestJson(`/api/resources/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  generateAdvisorPlan(payload: AdvisorRequest): Promise<AdvisorPlanResponse> {
    return requestJson('/api/advisor/plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
