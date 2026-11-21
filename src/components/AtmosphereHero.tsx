import { AlertTriangle, CheckCircle2, ShieldAlert, Thermometer, Wind } from 'lucide-react';
import { classifyAqiBand, getAqiSeverityTone } from '../../shared/airMath.ts';
import type { DomainVertical, ShieldMember, VerticalId } from '../../shared/types.ts';
import { SmogShieldList } from './SmogShieldList.tsx';

interface AtmosphereHeroProps {
  verticals: DomainVertical[];
  activeVertical: DomainVertical;
  maskOverrides: Record<string, ShieldMember['maskGrade']>;
  onSelectVertical: (id: VerticalId) => void;
  onChangeMask: (memberId: string, maskGrade: ShieldMember['maskGrade']) => void;
}

export function AtmosphereHero({
  verticals,
  activeVertical,
  maskOverrides,
  onSelectVertical,
  onChangeMask,
}: AtmosphereHeroProps) {
  const band = classifyAqiBand(activeVertical.aqi);
  const tone = getAqiSeverityTone(activeVertical.aqi);
  const maxForecast = Math.max(...activeVertical.hourlyForecast.map((f) => f.aqi), 200);
  const bestWindow = activeVertical.hourlyForecast.reduce((best, cur) =>
    cur.aqi < best.aqi ? cur : best
  );

  const glowClass =
    tone === 'safe'
      ? 'shadow-[0_8px_32px_-4px_rgba(5,150,105,0.22)] border-[#059669]/40'
      : tone === 'moderate'
        ? 'shadow-[0_8px_32px_-4px_rgba(245,158,11,0.22)] border-[#f59e0b]/40'
        : 'shadow-[0_8px_32px_-4px_rgba(225,29,72,0.28)] border-[#e11d48]/45';

  return (
    <section id="overview" aria-labelledby="overview-heading" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6bd8cb]">
            {activeVertical.regionLabel} · {activeVertical.seasonCondition}
          </p>
          <h1
            id="overview-heading"
            className="mt-1 max-w-2xl text-3xl font-extrabold tracking-tight text-[#dae2fd] sm:text-4xl [text-wrap:balance]"
          >
            Urban Winter Smog Defense
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Select deployment vertical"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#131b2e] p-1"
        >
          {verticals.map((v, idx) => {
            const active = v.id === activeVertical.id;
            return (
              <button
                key={v.id}
                id={`vertical-tab-${v.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="vertical-telemetry-panel"
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                  e.preventDefault();
                  const delta = e.key === 'ArrowRight' ? 1 : -1;
                  const next = verticals[(idx + delta + verticals.length) % verticals.length];
                  onSelectVertical(next.id);
                }}
                onClick={() => onSelectVertical(v.id)}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] ${
                  active
                    ? 'bg-[#059669] text-white'
                    : 'text-[#bccac0] hover:bg-white/5 hover:text-[#dae2fd]'
                }`}
              >
                {v.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="vertical-telemetry-panel"
        role="tabpanel"
        aria-labelledby={`vertical-tab-${activeVertical.id}`}
        className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
      >
        <div
          className={`glass-panel-alert flex flex-col justify-between rounded-2xl p-6 lg:col-span-7 ${glowClass}`}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#bccac0]">{activeVertical.city}</p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-mono text-5xl font-extrabold tracking-tight text-[#dae2fd] tabular-nums sm:text-6xl">
                    {activeVertical.aqi}
                  </span>
                  <span className="font-mono text-sm font-semibold text-[#bccac0]">US AQI</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#0b1326]/80 px-3.5 py-2">
                {tone === 'safe' ? (
                  <CheckCircle2 className="h-5 w-5 text-[#68dba9]" aria-hidden="true" />
                ) : tone === 'moderate' ? (
                  <AlertTriangle className="h-5 w-5 text-[#f59e0b]" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-[#ff5168]" aria-hidden="true" />
                )}
                <div className="text-left">
                  <div className="text-sm font-bold text-[#dae2fd]">{band}</div>
                  <div className="font-mono text-xs text-[#bccac0] tabular-nums">
                    PM2.5 {activeVertical.pm25} µg/m³
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#bccac0]">
              {activeVertical.inversionNote}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/10 py-3 text-xs text-[#bccac0]">
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Thermometer className="h-3.5 w-3.5 text-[#6bd8cb]" aria-hidden="true" />
                {activeVertical.temperatureC}°C ambient
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                <Wind className="h-3.5 w-3.5 text-[#6bd8cb]" aria-hidden="true" />
                {activeVertical.windKmh} km/h wind
              </span>
              <span className="font-medium text-[#68dba9]">
                Best ventilation window: {bestWindow.hour} (AQI {bestWindow.aqi})
              </span>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-[#bccac0]">
              <span className="font-semibold text-[#dae2fd]">Diurnal Inversion Dispersion</span>
              <span className="font-mono tabular-nums">06:00 – 21:00 AQI Curve</span>
            </div>
            <div className="grid grid-cols-6 gap-2 pt-2">
              {activeVertical.hourlyForecast.map((slot) => {
                const pct = Math.max(18, Math.round((slot.aqi / maxForecast) * 100));
                const isBest = slot.hour === bestWindow.hour;
                const barColor = isBest
                  ? 'bg-[#059669]'
                  : slot.aqi > 200
                    ? 'bg-[#e11d48]/85'
                    : 'bg-[#f59e0b]/85';
                return (
                  <div key={slot.hour} className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-[#dae2fd] tabular-nums">
                      {slot.aqi}
                    </span>
                    <div className="flex h-20 w-full items-end rounded-md bg-[#0b1326]/70 p-1">
                      <div
                        className={`w-full rounded-sm transition-all ${barColor}`}
                        style={{ height: `${pct}%` }}
                        aria-label={`${slot.hour}: AQI ${slot.aqi}`}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-[#87948b] tabular-nums">
                      {slot.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <SmogShieldList
            ambientAqi={activeVertical.aqi}
            shields={activeVertical.shields}
            maskOverrides={maskOverrides}
            onChangeMask={onChangeMask}
          />
        </div>
      </div>
    </section>
  );
}
