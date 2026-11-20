import type { Request, Response } from 'express';
import type { AdvisorRequest } from '../../shared/types.ts';
import { DOMAIN_VERTICALS } from '../data/verticalsSeed.ts';
import { generateAdvisorPlan } from '../services/aiAdvisorService.ts';
import { assertVerticalId, ResourceService } from '../services/resourceService.ts';
import { clampNumber, sanitizeText, ValidationError } from '../utils/sanitize.ts';

function handleError(res: Response, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  res.status(400).json({
    error: err instanceof Error ? err.message : 'Unable to process request.',
  });
}

export function createApiController(resourceService: ResourceService, apiKeyOverride?: string) {
  return {
    getHealth(_req: Request, res: Response): void {
      res.status(200).json({ status: 'ok', service: 'aeroshield-api', timestamp: new Date().toISOString() });
    },

    getVerticals(_req: Request, res: Response): void {
      res.status(200).json({ verticals: DOMAIN_VERTICALS });
    },

    listResources(req: Request, res: Response): void {
      try {
        const result = resourceService.listResources(req.query.verticalId);
        res.status(200).json(result);
      } catch (err) {
        handleError(res, err);
      }
    },

    createResource(req: Request, res: Response): void {
      try {
        const created = resourceService.createResource((req.body ?? {}) as Record<string, unknown>);
        res.status(201).json({ resource: created });
      } catch (err) {
        handleError(res, err);
      }
    },

    updateResource(req: Request, res: Response): void {
      try {
        const updated = resourceService.updateResource(
          String(req.params.id ?? ''),
          (req.body ?? {}) as Record<string, unknown>
        );
        res.status(200).json({ resource: updated });
      } catch (err) {
        handleError(res, err);
      }
    },

    deleteResource(req: Request, res: Response): void {
      try {
        resourceService.deleteResource(String(req.params.id ?? ''));
        res.status(200).json({ deleted: true });
      } catch (err) {
        handleError(res, err);
      }
    },

    async postAdvisorPlan(req: Request, res: Response): Promise<void> {
      try {
        const body = (req.body ?? {}) as Record<string, unknown>;
        const verticalId = assertVerticalId(body.verticalId ?? 'family');
        const preset = DOMAIN_VERTICALS.find((v) => v.id === verticalId) ?? DOMAIN_VERTICALS[0];
        const focusRaw = body.focusArea;
        const focusArea =
          focusRaw === 'routine' || focusRaw === 'indoor-hack' || focusRaw === 'sustainable-alt'
            ? focusRaw
            : 'all';

        const advisorReq: AdvisorRequest = {
          verticalId,
          city: sanitizeText(body.city ?? preset.city, 'city', 80, true),
          aqi: clampNumber(body.aqi ?? preset.aqi, 0, 500, preset.aqi),
          pm25: clampNumber(body.pm25 ?? preset.pm25, 0, 500, preset.pm25),
          lifestyle: sanitizeText(body.lifestyle ?? preset.defaultLifestyle, 'lifestyle', 600, true),
          householdNotes: sanitizeText(body.householdNotes ?? '', 'householdNotes', 600, false),
          focusArea,
        };

        const plan = await generateAdvisorPlan(advisorReq, apiKeyOverride);
        res.status(200).json(plan);
      } catch (err) {
        handleError(res, err);
      }
    },
  };
}
