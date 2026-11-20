import { Copy, Download, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type {
  AdvisorPlanResponse,
  AdvisorRecommendation,
  AdvisorRequest,
  DomainVertical,
} from '../../shared/types.ts';
import { AdvisorPlanResults } from './AdvisorPlanResults.tsx';

interface GenAiAdvisorPanelProps {
  activeVertical: DomainVertical;
  loading: boolean;
  plan: AdvisorPlanResponse | null;
  onGenerate: (req: AdvisorRequest) => Promise<void>;
  onApplyRecommendation: (rec: AdvisorRecommendation) => Promise<void>;
  onNotify: (text: string, tone?: 'success' | 'info' | 'error') => void;
}

export function GenAiAdvisorPanel({
  activeVertical,
  loading,
  plan,
  onGenerate,
  onApplyRecommendation,
  onNotify,
}: GenAiAdvisorPanelProps) {
  const [city, setCity] = useState(activeVertical.city);
  const [lifestyle, setLifestyle] = useState(activeVertical.defaultLifestyle);
  const [householdNotes, setHouseholdNotes] = useState('');
  const [focusArea, setFocusArea] = useState<AdvisorRequest['focusArea']>('all');
  const [appliedTitles, setAppliedTitles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCity(activeVertical.city);
    setLifestyle(activeVertical.defaultLifestyle);
    setHouseholdNotes('');
    setAppliedTitles({});
  }, [activeVertical]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onGenerate({
      verticalId: activeVertical.id,
      city,
      aqi: activeVertical.aqi,
      pm25: activeVertical.pm25,
      lifestyle,
      householdNotes,
      focusArea,
    });
  };

  const handleCopy = async () => {
    if (!plan) return;
    const text = [
      plan.executiveBrief,
      '',
      plan.riskSummary,
      '',
      ...plan.recommendations.map(
        (r, i) =>
          `${i + 1}. ${r.title} (${r.timeWindow})\nSteps: ${r.actionSteps}\nDirect Impact: ${r.directImpact} (-${r.pm25ReductionPct}% PM2.5, ${r.co2SavedKgPerMonth} kg CO2e/mo)`
      ),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      onNotify('Copied personalized smog defense plan to clipboard.');
    } catch {
      onNotify('Clipboard access blocked in this frame; use Export JSON instead.', 'info');
    }
  };

  const handleExport = () => {
    if (!plan) return;
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aeroshield-${activeVertical.id}-plan.json`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify('Exported plan as portable JSON.');
  };

  const handleApply = async (rec: AdvisorRecommendation) => {
    await onApplyRecommendation(rec);
    setAppliedTitles((prev) => ({ ...prev, [rec.title]: true }));
  };

  return (
    <section id="advisor" aria-labelledby="advisor-heading" className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="advisor-heading" className="text-xl font-bold text-[#dae2fd]">
            GenAI Smog Defense Advisor
          </h2>
          <p className="mt-1 text-sm text-[#bccac0]">
            Generate tailored low-emission routines, indoor air hacks, and sustainable alternatives with direct exposure math.
          </p>
        </div>
        {plan && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0d9488] bg-[#131b2e] px-3 text-xs font-semibold text-[#6bd8cb] transition-colors hover:bg-[#0d9488]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy Plan
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0d9488] bg-[#131b2e] px-3 text-xs font-semibold text-[#6bd8cb] transition-colors hover:bg-[#0d9488]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export JSON
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <label htmlFor="advisor-city" className="block text-xs font-semibold text-[#bccac0]">
            Location / Neighborhood
          </label>
          <input
            id="advisor-city"
            type="text"
            required
            maxLength={80}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0b1326]/80 px-3 py-2.5 text-sm text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
          />
        </div>

        <div className="lg:col-span-4">
          <label htmlFor="advisor-focus" className="block text-xs font-semibold text-[#bccac0]">
            Priority Focus
          </label>
          <select
            id="advisor-focus"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value as AdvisorRequest['focusArea'])}
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0b1326]/80 px-3 py-2.5 text-sm text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
          >
            <option value="all">Full Spectrum (Routine + Indoor + Sustainable)</option>
            <option value="routine">Low-Emission Daily Routines</option>
            <option value="indoor-hack">Indoor Air Quality Hacks</option>
            <option value="sustainable-alt">Sustainable Commute &amp; Heating Swaps</option>
          </select>
        </div>

        <div className="lg:col-span-4">
          <label htmlFor="advisor-notes" className="block text-xs font-semibold text-[#bccac0]">
            Constraints (Optional)
          </label>
          <input
            id="advisor-notes"
            type="text"
            maxLength={300}
            placeholder="e.g. gas stove, no central HVAC, tight budget"
            value={householdNotes}
            onChange={(e) => setHouseholdNotes(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0b1326]/80 px-3 py-2.5 text-sm text-[#dae2fd] placeholder:text-[#87948b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
          />
        </div>

        <div className="lg:col-span-9">
          <label htmlFor="advisor-lifestyle" className="block text-xs font-semibold text-[#bccac0]">
            Family, School, or Team Lifestyle Profile
          </label>
          <input
            id="advisor-lifestyle"
            type="text"
            required
            maxLength={500}
            value={lifestyle}
            onChange={(e) => setLifestyle(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#0b1326]/80 px-3 py-2.5 text-sm text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488]"
          />
        </div>

        <div className="flex items-end lg:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-[42px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#059669] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#047857] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing Smog...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Generate Plan
              </>
            )}
          </button>
        </div>
      </form>

      {plan && (
        <AdvisorPlanResults plan={plan} appliedTitles={appliedTitles} onApply={handleApply} />
      )}
    </section>
  );
}
