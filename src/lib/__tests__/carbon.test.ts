import { describe, expect, it } from '@jest/globals';
import {
  CARBON_FACTORS,
  CarbonFactor,
  DISPLACEMENT_RATE,
  estimateCo2e,
  estimateImpact,
  isSubcategory,
  pointsFromCo2e,
  POINTS_PER_KG,
  Subcategory,
  SUBCATEGORIES,
} from '../carbon';
import { browseCategories } from '../../constants/mockData';

describe('carbon factor table', () => {
  it('has an entry for every sub-category the Browse screen shows', () => {
    browseCategories.forEach((name) => {
      expect(isSubcategory(name)).toBe(true);
      expect(CARBON_FACTORS[name as Subcategory]).toBeDefined();
    });
  });

  it('has a positive weight and factor for every sub-category', () => {
    SUBCATEGORIES.forEach((s) => {
      expect(CARBON_FACTORS[s].weightKg).toBeGreaterThan(0);
      expect(CARBON_FACTORS[s].kgCo2ePerKg).toBeGreaterThan(0);
    });
  });

  it('uses a displacement rate between 0 and 1', () => {
    expect(DISPLACEMENT_RATE).toBeGreaterThan(0);
    expect(DISPLACEMENT_RATE).toBeLessThanOrEqual(1);
  });
});

describe('isSubcategory', () => {
  it('accepts a supported sub-category', () => {
    expect(isSubcategory('Outerwear')).toBe(true);
  });

  it('rejects unknown values, wrong case and the old categories', () => {
    expect(isSubcategory('Hats')).toBe(false);
    expect(isSubcategory('tops')).toBe(false);
    expect(isSubcategory('Electrical')).toBe(false);
    expect(isSubcategory('')).toBe(false);
  });
});

describe('estimateCo2e', () => {
  it('multiplies weight × factor × displacement rate', () => {
    const { weightKg, kgCo2ePerKg } = CARBON_FACTORS.Tops;
    expect(estimateCo2e('Tops')).toBeCloseTo(weightKg * kgCo2ePerKg * DISPLACEMENT_RATE);
  });

  it('gives a coat a bigger saving than a top', () => {
    expect(estimateCo2e('Outerwear')).toBeGreaterThan(estimateCo2e('Tops'));
  });

  it('uses a custom factor table when one is passed in (e.g. from Supabase)', () => {
    const custom: Record<Subcategory, CarbonFactor> = {
      ...CARBON_FACTORS,
      Tops: { weightKg: 1, kgCo2ePerKg: 10 },
    };
    expect(estimateCo2e('Tops', custom)).toBeCloseTo(10 * DISPLACEMENT_RATE);
  });
});

describe('pointsFromCo2e', () => {
  it('converts kg to points using POINTS_PER_KG', () => {
    expect(pointsFromCo2e(2)).toBe(2 * POINTS_PER_KG);
  });

  it('always returns a whole number', () => {
    expect(Number.isInteger(pointsFromCo2e(3.2345))).toBe(true);
  });

  it.each([0, -5, NaN, Infinity, -Infinity])('returns 0 for invalid input %p', (bad) => {
    expect(pointsFromCo2e(bad)).toBe(0);
  });
});

describe('estimateImpact', () => {
  it('returns kg rounded to 1 decimal place and whole points', () => {
    const impact = estimateImpact('Bottoms');
    expect(impact).not.toBeNull();
    expect(impact!.kgCo2e).toBe(Math.round(estimateCo2e('Bottoms') * 10) / 10);
    expect(Number.isInteger(impact!.points)).toBe(true);
    expect(impact!.points).toBeGreaterThan(0);
  });

  it('works out points from the unrounded kg, not the rounded display value', () => {
    expect(estimateImpact('Tops')!.points).toBe(pointsFromCo2e(estimateCo2e('Tops')));
  });

  it('returns null for an unsupported sub-category so screens can hide it', () => {
    expect(estimateImpact('Hats')).toBeNull();
  });
});
