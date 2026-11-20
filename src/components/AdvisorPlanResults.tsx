import { Check, PlusCircle } from 'lucide-react';
import type { AdvisorPlanResponse, AdvisorRecommendation } from '../../shared/types.ts';

interface AdvisorPlanResultsProps {
  plan: AdvisorPlanResponse;
  appliedTitles: Record<string, boolean>;
  onApply: (rec: AdvisorRecommendation) => Promise<void>;
}

export function AdvisorPlanResults({
  plan,
  appliedTitles,
  onApply,
}: AdvisorPlanResultsProps) {
  return (
    <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#bccac0]">
        <span>
          {plan.mode === 'ai'
            ? `Generated via ${plan.model}`
            : `Offline Heuristic Plan · ${plan.fallbackReason ?? 'Fallback active'}`}
        </span>
        <span className="font-mono font-semibold text-[#68dba9] tabular-nums">
          Projected: -{plan.projectedPm25DropPct}% PM2.5 · {plan.projectedMonthlyCo2Kg} kg CO2e/mo
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#131b2e]/90 p-4">
        <h3 className="text-base font-semibold text-[#dae2fd]">{plan.executiveBrief}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-[#bccac0]">{plan.riskSummary}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plan.recommendations.map((rec) => {
          const applied = Boolean(appliedTitles[rec.title]);
          return (
            <article
              key={rec.title}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#131b2e] p-4"
            >
              <div>
                <p className="text-xs font-medium text-[#6bd8cb]">
                  {rec.category.replace('-', ' ')} · {rec.timeWindow} · {rec.priority} priority
                </p>
                <h4 className="mt-1.5 text-base font-semibold text-[#dae2fd]">{rec.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-[#bccac0]">{rec.actionSteps}</p>
                <p className="mt-3 border-t border-white/10 pt-2.5 text-xs leading-relaxed text-[#68dba9]">
                  Direct impact: {rec.directImpact}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                <span className="font-mono text-xs text-[#bccac0] tabular-nums">
                  -{rec.pm25ReductionPct}% PM2.5 · {rec.co2SavedKgPerMonth} kg CO2
                </span>
                <button
                  type="button"
                  disabled={applied}
                  onClick={() => void onApply(rec)}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#68dba9]/30 bg-[#059669]/20 px-3 py-1.5 text-xs font-semibold text-[#68dba9] transition-colors hover:bg-[#059669] hover:text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
                >
                  {applied ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Applied
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Apply to Plan
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
