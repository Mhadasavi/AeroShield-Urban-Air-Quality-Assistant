import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateAggregateImpact,
  calculateAqiFromPm25,
  calculateIndoorClearanceMinutes,
  calculateMemberExposureIndex,
  classifyAqiBand,
  getAqiSeverityTone,
} from '../../shared/airMath.ts';
import type { ActionResource } from '../../shared/types.ts';

describe('Tier 1 — Core Air Quality Business Math Invariants', () => {
  it('computes EPA PM2.5-to-AQI breakpoints accurately across bands', () => {
    assert.equal(calculateAqiFromPm25(0), 0);
    assert.equal(calculateAqiFromPm25(12.0), 50);
    assert.equal(calculateAqiFromPm25(35.4), 100);
    assert.equal(calculateAqiFromPm25(55.4), 150);
    assert.equal(calculateAqiFromPm25(150.4), 200);
    assert.equal(calculateAqiFromPm25(250.4), 300);
    assert.equal(calculateAqiFromPm25(600), 500);
  });

  it('clamps negative and NaN PM2.5 values safely to 0', () => {
    assert.equal(calculateAqiFromPm25(-25), 0);
    assert.equal(calculateAqiFromPm25(Number.NaN), 0);
  });

  it('classifies AQI bands and semantic severity tones consistently', () => {
    assert.equal(classifyAqiBand(42), 'Good');
    assert.equal(classifyAqiBand(88), 'Moderate');
    assert.equal(classifyAqiBand(132), 'Sensitive');
    assert.equal(classifyAqiBand(180), 'Unhealthy');
    assert.equal(classifyAqiBand(268), 'Very Unhealthy');
    assert.equal(classifyAqiBand(340), 'Hazardous');
    assert.equal(getAqiSeverityTone(42), 'safe');
    assert.equal(getAqiSeverityTone(88), 'moderate');
    assert.equal(getAqiSeverityTone(180), 'hazard');
  });

  it('monotonically reduces personal exposure index as respirator filtration improves', () => {
    const base = {
      ambientAqi: 260,
      sensitivity: 'Asthma Alert' as const,
      outdoorMinutes: 90,
      indoorFiltration: true,
    };
    const none = calculateMemberExposureIndex({ ...base, maskGrade: 'None' });
    const kn95 = calculateMemberExposureIndex({ ...base, maskGrade: 'KN95' });
    const n95 = calculateMemberExposureIndex({ ...base, maskGrade: 'N95' });
    const p100 = calculateMemberExposureIndex({ ...base, maskGrade: 'P100' });

    assert.ok(none > kn95);
    assert.ok(kn95 > n95);
    assert.ok(n95 >= p100);
  });

  it('assigns higher exposure index to sensitive respiratory profiles than standard profiles', () => {
    const standard = calculateMemberExposureIndex({
      ambientAqi: 200,
      sensitivity: 'Standard',
      outdoorMinutes: 60,
      maskGrade: 'KN95',
      indoorFiltration: true,
    });
    const asthma = calculateMemberExposureIndex({
      ambientAqi: 200,
      sensitivity: 'Asthma Alert',
      outdoorMinutes: 60,
      maskGrade: 'KN95',
      indoorFiltration: true,
    });
    assert.ok(asthma > standard);
  });

  it('computes exponential indoor CADR clearance minutes inversely proportional to CADR', () => {
    assert.equal(
      calculateIndoorClearanceMinutes({ roomVolumeM3: 50, cadrM3h: 300, currentPm25: 10 }),
      0
    );
    const lowCadr = calculateIndoorClearanceMinutes({
      roomVolumeM3: 50,
      cadrM3h: 150,
      currentPm25: 120,
    });
    const highCadr = calculateIndoorClearanceMinutes({
      roomVolumeM3: 50,
      cadrM3h: 450,
      currentPm25: 120,
    });
    assert.ok(lowCadr > highCadr);
    assert.ok(highCadr >= 1);
  });

  it('aggregates multiplicative PM2.5 exposure reduction without ever exceeding 88%', () => {
    const mockResources: ActionResource[] = [
      {
        id: '1',
        verticalId: 'family',
        title: 'HEPA',
        category: 'indoor-hack',
        priority: 'High',
        timeWindow: '24/7',
        description: 'HEPA',
        impactSummary: 'Impact',
        pm25ReductionPct: 50,
        co2SavedKgPerMonth: 20,
        costEstimate: '$0',
        completed: true,
        source: 'user',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        verticalId: 'family',
        title: 'Seal',
        category: 'routine',
        priority: 'High',
        timeWindow: '24/7',
        description: 'Seal',
        impactSummary: 'Impact',
        pm25ReductionPct: 50,
        co2SavedKgPerMonth: 30,
        costEstimate: '$0',
        completed: true,
        source: 'user',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        verticalId: 'family',
        title: 'Paused',
        category: 'sustainable-alt',
        priority: 'Low',
        timeWindow: 'Daily',
        description: 'Paused',
        impactSummary: 'Impact',
        pm25ReductionPct: 40,
        co2SavedKgPerMonth: 100,
        costEstimate: '$0',
        completed: false,
        source: 'user',
        createdAt: '',
        updatedAt: '',
      },
    ];
    const impact = calculateAggregateImpact(mockResources);
    assert.equal(impact.activeCount, 2);
    assert.equal(impact.totalCount, 3);
    assert.equal(impact.combinedPm25ReductionPct, 75);
    assert.equal(impact.monthlyCo2SavedKg, 50);
    assert.equal(impact.annualCo2SavedKg, 600);
    assert.ok(impact.equivalentTrees > 25);
  });
});
