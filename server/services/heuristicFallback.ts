import { classifyAqiBand } from '../../shared/airMath.ts';
import type {
  AdvisorPlanResponse,
  AdvisorRecommendation,
  AdvisorRequest,
} from '../../shared/types.ts';

function buildVerticalRecommendations(req: AdvisorRequest): AdvisorRecommendation[] {
  const highSeverity = req.aqi >= 151;
  const focus = req.focusArea;

  const base: AdvisorRecommendation[] = [
    {
      title: highSeverity
        ? `Inversion-Safe Midday Window (${req.city})`
        : `Low-Emission Commute Shift (${req.city})`,
      category: 'routine',
      priority: 'High',
      timeWindow: highSeverity ? '12:30 – 15:00' : '08:00 – 18:00',
      actionSteps: highSeverity
        ? `Keep exterior doors and trickle vents sealed from 06:00–11:30 when nocturnal PM2.5 (${req.pm25} µg/m³) peaks. Consolidate outdoor errands into the 12:30–15:00 mixing trough and wear fitted N95/KN95 respirators.`
        : `Shift short vehicle trips under 3 km to electric transit or carpool waves and pre-heat interiors using off-peak electric timers rather than engine idling.`,
      directImpact: `Lowers personal daily PM2.5 inhalation dose by ${highSeverity ? 46 : 28}% and eliminates cold-start exhaust bursts.`,
      pm25ReductionPct: highSeverity ? 46 : 28,
      co2SavedKgPerMonth: req.verticalId === 'family' ? 32 : 185,
      costEstimate: '$0 / month',
    },
    {
      title: 'High-CADR MERV-13 Clean Room & Draft Seal Protocol',
      category: 'indoor-hack',
      priority: 'High',
      timeWindow: '24/7 Overnight Priority',
      actionSteps:
        'Designate primary sleeping or occupied zones as positive-filtration rooms. Seal window sash gaps with silicone weatherstrips, damp-mop floors instead of dry sweeping, and run HEPA or Corsi-Rosenthal MERV-13 filtration at 4–5 air changes per hour.',
      directImpact: `Reduces indoor fine particulate buildup by 54% (bringing ${req.pm25} µg/m³ ambient air down toward safe indoor thresholds in under 30 minutes).`,
      pm25ReductionPct: 54,
      co2SavedKgPerMonth: 11,
      costEstimate: '$45–$70 one-time',
    },
    {
      title:
        req.verticalId === 'family'
          ? 'Electric Induction & Wet-Wipe Thermal Entry Buffer'
          : req.verticalId === 'community'
            ? 'Neighborhood No-Idling Curb & Electric Shuttle Loop'
            : 'Hybrid Smog-Trigger Policy & Cargo E-Bike Dispatch',
      category: 'sustainable-alt',
      priority: 'Medium',
      timeWindow: 'Daily Habit Replacement',
      actionSteps:
        req.verticalId === 'family'
          ? 'Replace open-flame gas boiling, scented candles, and incense with electric kettle/induction cooking and exhaust hood pre-run. Keep shoes and coats in an entry vestibule to halt tracked soot.'
          : req.verticalId === 'community'
            ? 'Launch a shared parent electric carpool roster and enforce a 150 m zero-idling perimeter around school gates with visible air-band flags.'
            : 'Activate automatic remote-work permissions when 07:00 AQI exceeds 175 and consolidate courier runs onto electric cargo bikes during midday dips.',
      directImpact: `Avoids ${req.verticalId === 'family' ? 42 : 310} kg CO2e per month while cutting indoor NO2 and black carbon accumulation by 31%.`,
      pm25ReductionPct: 31,
      co2SavedKgPerMonth: req.verticalId === 'family' ? 42 : 310,
      costEstimate: req.verticalId === 'family' ? '$55 one-time' : '$0–$90 / month',
    },
  ];

  if (focus === 'all') return base;
  return base.filter((item) => item.category === focus).concat(
    base.filter((item) => item.category !== focus).slice(0, 1)
  );
}

export function buildHeuristicAdvisorPlan(
  req: AdvisorRequest,
  reason: string
): AdvisorPlanResponse {
  const band = classifyAqiBand(req.aqi);
  const recommendations = buildVerticalRecommendations(req);
  let remaining = 1;
  let co2 = 0;
  for (const r of recommendations) {
    remaining *= 1 - r.pm25ReductionPct / 100;
    co2 += r.co2SavedKgPerMonth;
  }

  return {
    mode: 'fallback',
    model: 'deterministic-air-heuristic-v1',
    fallbackReason: reason,
    generatedAt: new Date().toISOString(),
    executiveBrief: `Winter Smog Action Plan for ${req.city} (AQI ${req.aqi} · ${band}). Tailored to: ${req.lifestyle.slice(0, 140)}`,
    riskSummary: `Ambient PM2.5 at ${req.pm25} µg/m³ exceeds WHO 24-hour guidance (15 µg/m³) by ${(req.pm25 / 15).toFixed(1)}x. Prioritizing sealed morning envelopes, MERV-13/HEPA clean zones, and zero-combustion swaps immediately cuts respiratory exposure.`,
    recommendations,
    projectedPm25DropPct: Math.min(86, Math.round((1 - remaining) * 100)),
    projectedMonthlyCo2Kg: Math.round(co2),
  };
}
