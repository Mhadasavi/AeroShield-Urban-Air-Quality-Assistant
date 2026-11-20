export type VerticalId = 'family' | 'community' | 'workplace';

export type AqiBand = 'Good' | 'Moderate' | 'Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export type SensitivityLevel = 'Standard' | 'Pediatric' | 'Asthma Alert' | 'Senior Cardiopulmonary' | 'Outdoor Commuter';

export type ResourceCategory = 'routine' | 'indoor-hack' | 'sustainable-alt';

export type ResourcePriority = 'High' | 'Medium' | 'Low';

export interface PollutantMetric {
  id: string;
  label: string;
  unit: string;
  value: number;
  safeLimit: number;
  deltaPct: number;
  trend6h: number[];
  tooltip: string;
}

export interface ShieldMember {
  id: string;
  name: string;
  role: string;
  sensitivity: SensitivityLevel;
  outdoorMinutes: number;
  maskGrade: 'None' | 'KN95' | 'N95' | 'P100';
  indoorFiltration: boolean;
  exposureIndex: number;
  guidance: string;
}

export interface DomainVertical {
  id: VerticalId;
  name: string;
  city: string;
  regionLabel: string;
  seasonCondition: string;
  inversionNote: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  vocPpb: number;
  humidityPct: number;
  temperatureC: number;
  windKmh: number;
  metrics: PollutantMetric[];
  shields: ShieldMember[];
  defaultLifestyle: string;
  hourlyForecast: { hour: string; aqi: number; pm25: number }[];
}

export interface ActionResource {
  id: string;
  verticalId: VerticalId;
  title: string;
  category: ResourceCategory;
  priority: ResourcePriority;
  timeWindow: string;
  description: string;
  impactSummary: string;
  pm25ReductionPct: number;
  co2SavedKgPerMonth: number;
  costEstimate: string;
  completed: boolean;
  source: 'preset' | 'ai' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceInput {
  verticalId: VerticalId;
  title: string;
  category: ResourceCategory;
  priority: ResourcePriority;
  timeWindow: string;
  description: string;
  impactSummary: string;
  pm25ReductionPct: number;
  co2SavedKgPerMonth: number;
  costEstimate: string;
  source?: 'preset' | 'ai' | 'user';
}

export interface UpdateResourceInput {
  title?: string;
  category?: ResourceCategory;
  priority?: ResourcePriority;
  timeWindow?: string;
  description?: string;
  impactSummary?: string;
  pm25ReductionPct?: number;
  co2SavedKgPerMonth?: number;
  costEstimate?: string;
  completed?: boolean;
}

export interface AdvisorRequest {
  verticalId: VerticalId;
  city: string;
  aqi: number;
  pm25: number;
  lifestyle: string;
  householdNotes: string;
  focusArea: 'all' | 'routine' | 'indoor-hack' | 'sustainable-alt';
}

export interface AdvisorRecommendation {
  title: string;
  category: ResourceCategory;
  priority: ResourcePriority;
  timeWindow: string;
  actionSteps: string;
  directImpact: string;
  pm25ReductionPct: number;
  co2SavedKgPerMonth: number;
  costEstimate: string;
}

export interface AdvisorPlanResponse {
  mode: 'ai' | 'fallback';
  model: string;
  fallbackReason?: string;
  generatedAt: string;
  executiveBrief: string;
  riskSummary: string;
  recommendations: AdvisorRecommendation[];
  projectedPm25DropPct: number;
  projectedMonthlyCo2Kg: number;
}
