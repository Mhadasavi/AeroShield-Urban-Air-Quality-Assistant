import { GoogleGenAI, Type } from '@google/genai';
import type {
  AdvisorPlanResponse,
  AdvisorRecommendation,
  AdvisorRequest,
  ResourceCategory,
  ResourcePriority,
} from '../../shared/types.ts';
import { clampNumber, sanitizeText } from '../utils/sanitize.ts';
import { buildHeuristicAdvisorPlan } from './heuristicFallback.ts';

const GEMINI_MODEL = 'gemini-4-hydrogen';

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    executiveBrief: { type: Type.STRING },
    riskSummary: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          priority: { type: Type.STRING },
          timeWindow: { type: Type.STRING },
          actionSteps: { type: Type.STRING },
          directImpact: { type: Type.STRING },
          pm25ReductionPct: { type: Type.NUMBER },
          co2SavedKgPerMonth: { type: Type.NUMBER },
          costEstimate: { type: Type.STRING },
        },
      },
    },
  },
};

function normalizeCategory(raw: unknown): ResourceCategory {
  if (raw === 'routine' || raw === 'indoor-hack' || raw === 'sustainable-alt') return raw;
  return 'routine';
}

function normalizePriority(raw: unknown): ResourcePriority {
  if (raw === 'High' || raw === 'Medium' || raw === 'Low') return raw;
  return 'Medium';
}

function normalizeRecommendation(raw: Record<string, unknown>): AdvisorRecommendation {
  return {
    title: sanitizeText(String(raw.title ?? 'Air Quality Protocol'), 'title', 110, false) || 'Air Quality Protocol',
    category: normalizeCategory(raw.category),
    priority: normalizePriority(raw.priority),
    timeWindow: sanitizeText(String(raw.timeWindow ?? 'Daily'), 'timeWindow', 48, false) || 'Daily',
    actionSteps: sanitizeText(String(raw.actionSteps ?? ''), 'actionSteps', 420, false),
    directImpact: sanitizeText(String(raw.directImpact ?? ''), 'directImpact', 240, false),
    pm25ReductionPct: clampNumber(raw.pm25ReductionPct, 5, 75, 25),
    co2SavedKgPerMonth: clampNumber(raw.co2SavedKgPerMonth, 0, 1200, 20),
    costEstimate: sanitizeText(String(raw.costEstimate ?? '$0'), 'costEstimate', 40, false) || '$0',
  };
}

export async function generateAdvisorPlan(
  req: AdvisorRequest,
  apiKeyOverride?: string
): Promise<AdvisorPlanResponse> {
  const apiKey = apiKeyOverride !== undefined ? apiKeyOverride : process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length < 10) {
    return buildHeuristicAdvisorPlan(
      req,
      'Live Gemini API key is not configured in this environment; generated verified offline smog-defense plan.'
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = [
    `Create a practical, scientifically grounded winter smog defense plan for:`,
    `- Domain Vertical: ${req.verticalId}`,
    `- Location: ${req.city} (Current AQI: ${req.aqi}, PM2.5: ${req.pm25} µg/m³)`,
    `- Lifestyle & Profile: ${req.lifestyle}`,
    `- Additional Constraints: ${req.householdNotes || 'Standard winter heating & commute constraints'}`,
    `- Requested Focus: ${req.focusArea}`,
    `Return exactly 3 high-impact recommendations covering low-emission routines ("routine"), indoor air quality hacks ("indoor-hack"), and sustainable alternatives ("sustainable-alt").`,
    `Explain the exact direct health and emission impact of each choice clearly.`,
  ].join('\n');

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an urban air quality scientist and environmental health advisor. Output concise, accurate JSON with realistic PM2.5 reduction percentages (10-65%) and monthly CO2e savings in kg. Never include markdown code fences.',
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      executiveBrief?: string;
      riskSummary?: string;
      recommendations?: Record<string, unknown>[];
    };

    const items = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.slice(0, 4).map(normalizeRecommendation)
      : [];

    if (items.length === 0) {
      return buildHeuristicAdvisorPlan(req, 'Model returned an empty schedule; using deterministic fallback.');
    }

    let remaining = 1;
    let monthlyCo2 = 0;
    for (const item of items) {
      remaining *= 1 - item.pm25ReductionPct / 100;
      monthlyCo2 += item.co2SavedKgPerMonth;
    }

    return {
      mode: 'ai',
      model: GEMINI_MODEL,
      generatedAt: new Date().toISOString(),
      executiveBrief: sanitizeText(parsed.executiveBrief ?? '', 'executiveBrief', 260, false) || `Tailored smog plan for ${req.city}`,
      riskSummary: sanitizeText(parsed.riskSummary ?? '', 'riskSummary', 340, false),
      recommendations: items,
      projectedPm25DropPct: Math.min(86, Math.round((1 - remaining) * 100)),
      projectedMonthlyCo2Kg: Math.round(monthlyCo2),
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Upstream AI request failed';
    return buildHeuristicAdvisorPlan(
      req,
      `Live AI advisor temporarily unavailable (${reason.slice(0, 90)}); served verified offline plan.`
    );
  }
}
