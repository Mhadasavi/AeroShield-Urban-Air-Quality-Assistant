import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { calculateAggregateImpact } from '../../shared/airMath.ts';
import type { ActionResource, ResourceCategory } from '../../shared/types.ts';

interface ActionPlanSectionProps {
  resources: ActionResource[];
  categoryFilter: 'all' | ResourceCategory;
  searchQuery: string;
  onCategoryChange: (filter: 'all' | ResourceCategory) => void;
  onSearchChange: (q: string) => void;
  onToggleComplete: (resource: ActionResource) => Promise<void>;
  onEdit: (resource: ActionResource) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenCreate: () => void;
}

const FILTER_TABS: { id: 'all' | ResourceCategory; label: string }[] = [
  { id: 'all', label: 'All Protocols' },
  { id: 'routine', label: 'Low-Emission Routines' },
  { id: 'indoor-hack', label: 'Indoor Air Hacks' },
  { id: 'sustainable-alt', label: 'Sustainable Alternatives' },
];

export function ActionPlanSection({
  resources,
  categoryFilter,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenCreate,
}: ActionPlanSectionProps) {
  const impact = calculateAggregateImpact(resources);
  const query = searchQuery.trim().toLowerCase();
  const visible = resources.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      query.length === 0 ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.impactSummary.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = FILTER_TABS[(idx + delta + FILTER_TABS.length) % FILTER_TABS.length];
    onCategoryChange(next.id);
  };

  return (
    <section id="action-plan" aria-labelledby="action-plan-heading" className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="action-plan-heading" className="text-xl font-bold text-[#dae2fd]">
            Active Smog Defense Plan
          </h2>
          <p className="mt-1 text-sm text-[#bccac0]">
            Check off active protocols to recalculate your household or community PM2.5 and CO2e impact.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-xl border border-white/10 bg-[#131b2e] px-4 py-3 font-mono tabular-nums">
          <div>
            <div className="text-[11px] text-[#87948b]">PM2.5 Exposure Drop</div>
            <div className="text-lg font-bold text-[#68dba9]">-{impact.combinedPm25ReductionPct}%</div>
          </div>
          <div>
            <div className="text-[11px] text-[#87948b]">CO2e Avoided / Yr</div>
            <div className="text-lg font-bold text-[#6bd8cb]">{impact.annualCo2SavedKg} kg</div>
          </div>
          <div>
            <div className="text-[11px] text-[#87948b]">Tree Equivalent</div>
            <div className="text-lg font-bold text-[#dae2fd]">{impact.equivalentTrees}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          role="tablist"
          aria-label="Filter action protocols by category"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#131b2e] p-1"
        >
          {FILTER_TABS.map((tab, idx) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                id={`protocol-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="protocol-tabpanel"
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                onClick={() => onCategoryChange(tab.id)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] ${
                  active
                    ? 'bg-[#222a3d] text-[#dae2fd]'
                    : 'text-[#bccac0] hover:text-[#dae2fd]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="action-search" className="sr-only">
            Search action protocols
          </label>
          <div className="relative flex-1 md:w-64">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#87948b]"
              aria-hidden="true"
            />
            <input
              id="action-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search protocols..."
              className="w-full rounded-lg border border-white/15 bg-[#131b2e] py-2 pr-3 pl-9 text-sm text-[#dae2fd] placeholder:text-[#87948b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
            />
          </div>
        </div>
      </div>

      <div
        id="protocol-tabpanel"
        role="tabpanel"
        aria-labelledby={`protocol-tab-${categoryFilter}`}
      >
        {visible.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center">
            <p className="text-base font-semibold text-[#dae2fd]">No matching protocols found</p>
            <p className="mt-1 max-w-md text-sm text-[#bccac0]">
              Adjust your filter or add a custom routine, indoor air hack, or sustainable alternative to track its impact.
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#059669] px-4 py-2 text-sm font-semibold text-white hover:bg-[#047857] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add First Protocol
            </button>
          </div>
        ) : (
          <ul
            aria-label="Smog defense action protocols"
            className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#171f33]/85"
          >
            {visible.map((item) => {
              const checkboxId = `protocol-active-${item.id}`;
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-[#1e293b]/55 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="pt-0.5">
                      <label htmlFor={checkboxId} className="sr-only">
                        Mark {item.title} as active
                      </label>
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => void onToggleComplete(item)}
                        className="h-5 w-5 cursor-pointer rounded border-white/30 bg-[#0b1326] accent-[#059669] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#87948b]">
                        <span className="font-medium text-[#6bd8cb]">
                          {item.category.replace('-', ' ')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.timeWindow}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.priority} priority</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.costEstimate}</span>
                      </div>
                      <h3 className="mt-1 text-base font-semibold text-[#dae2fd]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#bccac0]">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs font-medium text-[#68dba9]">
                        Direct Impact: {item.impactSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right font-mono text-xs tabular-nums">
                      <div className="font-bold text-[#68dba9]">-{item.pm25ReductionPct}% PM2.5</div>
                      <div className="text-[#bccac0]">{item.co2SavedKgPerMonth} kg CO2/mo</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.title}`}
                        className="rounded-lg border border-white/10 p-2 text-[#bccac0] transition-colors hover:border-[#6bd8cb] hover:text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(item.id)}
                        aria-label={`Delete ${item.title}`}
                        className="rounded-lg border border-white/10 p-2 text-[#bccac0] transition-colors hover:border-[#e11d48] hover:text-[#ff5168] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5168]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
