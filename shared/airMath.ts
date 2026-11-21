import type { ActionResource, AqiBand, SensitivityLevel, ShieldMember } from './types.ts';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
  { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
  { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
];

/**
 * Converts ambient PM2.5 (µg/m³) into US EPA AQI using linear breakpoint interpolation.
 * Time Complexity: O(1) — scans fixed 7-entry EPA breakpoint table.
 * Space Complexity: O(1)
 */
export function calculateAqiFromPm25(pm25Raw: number): number {
  const pm25 = Math.max(0, Math.min(500.4, Number.isFinite(pm25Raw) ? pm25Raw : 0));
  const truncated = Math.floor(pm25 * 10) / 10;
  for (const bp of PM25_BREAKPOINTS) {
    if (truncated >= bp.cLow && truncated <= bp.cHigh) {
      const ratio = (bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow);
      return Math.round(ratio * (truncated - bp.cLow) + bp.iLow);
    }
  }
  return 500;
}

/**
 * Classifies numeric AQI into its clinical US EPA band.
 * Time Complexity: O(1) | Space Complexity: O(1)
 */
export function classifyAqiBand(aqi: number): AqiBand {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Maps numeric AQI to its semantic visual tone.
 * Time Complexity: O(1) | Space Complexity: O(1)
 */
export function getAqiSeverityTone(aqi: number): 'safe' | 'moderate' | 'hazard' {
  if (aqi <= 50) return 'safe';
  if (aqi <= 100) return 'moderate';
  return 'hazard';
}

const SENSITIVITY_MULTIPLIER: Record<SensitivityLevel, number> = {
  Standard: 1.0,
  'Outdoor Commuter': 1.18,
  Pediatric: 1.32,
  'Asthma Alert': 1.45,
  'Senior Cardiopulmonary': 1.38,
};

const MASK_FILTRATION_FACTOR: Record<ShieldMember['maskGrade'], number> = {
  None: 1.0,
  KN95: 0.22,
  N95: 0.14,
  P100: 0.05,
};

/**
 * Estimates 24-hour respiratory exposure index weighted by outdoor time, mask grade,
 * indoor filtration status, and physiological sensitivity.
 * Time Complexity: O(1) | Space Complexity: O(1)
 */
export function calculateMemberExposureIndex(params: {
  ambientAqi: number;
  sensitivity: SensitivityLevel;
  outdoorMinutes: number;
  maskGrade: ShieldMember['maskGrade'];
  indoorFiltration: boolean;
}): number {
  const aqi = Math.max(0, Math.min(500, params.ambientAqi));
  const outdoorHours = Math.max(0, Math.min(24, params.outdoorMinutes / 60));
  const indoorHours = Math.max(0, 24 - outdoorHours);
  const indoorFactor = params.indoorFiltration ? 0.28 : 0.68;
  const outdoorEffective = aqi * MASK_FILTRATION_FACTOR[params.maskGrade];
  const indoorEffective = aqi * indoorFactor;
  const weightedDaily = (outdoorEffective * outdoorHours + indoorEffective * indoorHours) / 24;
  const adjusted = weightedDaily * SENSITIVITY_MULTIPLIER[params.sensitivity];
  return Math.max(0, Math.min(500, Math.round(adjusted)));
}

/**
 * Models exponential indoor PM2.5 clearance time (minutes) via ACH = CADR / Volume.
 * Time Complexity: O(1) | Space Complexity: O(1)
 */
export function calculateIndoorClearanceMinutes(params: {
  roomVolumeM3: number;
  cadrM3h: number;
  currentPm25: number;
  targetPm25?: number;
}): number {
  const volume = Math.max(10, params.roomVolumeM3);
  const cadr = Math.max(20, params.cadrM3h);
  const target = Math.max(5, params.targetPm25 ?? 12);
  if (params.currentPm25 <= target) return 0;
  const ach = cadr / volume;
  const hours = Math.log(params.currentPm25 / target) / ach;
  return Math.max(1, Math.round(hours * 60));
}

/**
 * Aggregates multiplicative PM2.5 reduction and additive CO2e savings across n protocols.
 * Time Complexity: O(n) where n = resources.length
 * Space Complexity: O(1) auxiliary space (single pass without intermediate copies)
 */
export function calculateAggregateImpact(resources: ActionResource[]): {
  activeCount: number;
  totalCount: number;
  combinedPm25ReductionPct: number;
  monthlyCo2SavedKg: number;
  annualCo2SavedKg: number;
  equivalentTrees: number;
} {
  let activeCount = 0;
  let remainingExposure = 1;
  let monthlyCo2 = 0;

  for (const item of resources) {
    if (!item.completed) continue;
    activeCount += 1;
    const pct = Math.max(0, Math.min(80, item.pm25ReductionPct)) / 100;
    remainingExposure *= 1 - pct;
    monthlyCo2 += Math.max(0, item.co2SavedKgPerMonth);
  }

  const combinedPm25ReductionPct = Math.min(88, Math.round((1 - remainingExposure) * 100));
  const annualCo2SavedKg = Math.round(monthlyCo2 * 12);
  const equivalentTrees = Number((annualCo2SavedKg / 21.77).toFixed(1));

  return {
    activeCount,
    totalCount: resources.length,
    combinedPm25ReductionPct,
    monthlyCo2SavedKg: Math.round(monthlyCo2),
    annualCo2SavedKg,
    equivalentTrees,
  };
}
