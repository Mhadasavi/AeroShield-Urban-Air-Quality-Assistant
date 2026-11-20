import { Info } from 'lucide-react';
import { useState } from 'react';
import type { PollutantMetric } from '../../shared/types.ts';
import { SparklineSvg } from './SparklineSvg.tsx';

interface TelemetryStripProps {
  metrics: PollutantMetric[];
}

export function TelemetryStrip({ metrics }: TelemetryStripProps) {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  return (
    <section aria-labelledby="telemetry-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="telemetry-heading" className="text-lg font-semibold text-[#dae2fd]">
          Pollutant Telemetry
        </h2>
        <span className="text-xs text-[#87948b]">6-hour trend · WHO reference limits</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => {
          const exceeded = metric.value > metric.safeLimit;
          const stroke = exceeded ? '#ff5168' : '#68dba9';
          const isOpen = activeTooltipId === metric.id;

          return (
            <article
              key={metric.id}
              className="glass-panel relative flex flex-col justify-between rounded-2xl p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-[#bccac0]">
                  {metric.label}
                </span>
                <button
                  type="button"
                  aria-label={`About ${metric.label}`}
                  aria-expanded={isOpen}
                  onClick={() => setActiveTooltipId(isOpen ? null : metric.id)}
                  className="rounded p-1 text-[#87948b] transition-colors hover:text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9]"
                >
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {isOpen && (
                <p className="mt-2 rounded-lg border border-white/10 bg-[#0b1326] p-2 text-xs leading-snug text-[#bccac0]">
                  {metric.tooltip}
                </p>
              )}

              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1 font-mono tabular-nums">
                    <span className="text-2xl font-bold text-[#dae2fd]">{metric.value}</span>
                    <span className="text-[11px] text-[#87948b]">{metric.unit}</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] tabular-nums text-[#bccac0]">
                    {metric.deltaPct >= 0 ? `+${metric.deltaPct}%` : `${metric.deltaPct}%`} · limit{' '}
                    {metric.safeLimit}
                  </p>
                </div>

                <SparklineSvg points={metric.trend6h} strokeColor={stroke} label={metric.label} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
