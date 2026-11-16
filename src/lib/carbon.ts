/**
 * Carbon calculator for the CS385 Student Marketplace.
 *
 * Estimates the CO₂e saved when a clothing item is swapped instead of bought new,
 * and converts it into the points shown in the app.
 *
 *   kg CO₂e saved = typical weight (kg) × emission factor (kg CO₂e per kg) × displacement rate
 *   points        = round(kg CO₂e saved × POINTS_PER_KG)
 *
 * All functions here are pure (no network, no state), so they work offline and are easy to test.
 * Later, the emission factors will come from the `carbon_factors` table in Supabase, which an
 * Edge Function fills from the Climatiq API. The table below is the offline fallback and the
 * source of truth until then. Sources for every number belong in docs/carbon-credits.md.
 */

/** The clothing sub-categories the marketplace supports (matches browseCategories in mockData). */
export const SUBCATEGORIES = [
  'Tops',
  'Bottoms',
  'Outerwear',
  'Dresses',
  'Footwear',
  'Accessories',
  'Bags',
] as const;

/** One of the supported clothing sub-categories. */
export type Subcategory = (typeof SUBCATEGORIES)[number];

/** The numbers used to estimate the footprint of one sub-category. */
export interface CarbonFactor {
  /** Typical weight of one item, in kg. */
  weightKg: number;
  /** Production emissions per kg of product, in kg CO₂e per kg. */
  kgCo2ePerKg: number;
}

/**
 * PLACEHOLDER emission factor (kg CO₂e per kg of clothing).
 * Replace with the Climatiq factor the team chooses, and record its activity ID and
 * source in docs/carbon-credits.md (Step 4 replaces this with values from Supabase).
 */
export const PLACEHOLDER_TEXTILE_FACTOR = 20;

/**
 * Share of second-hand purchases that replace buying something new.
 * WRAP found an average resale displacement rate of 64.6%, so only that share counts.
 */
export const DISPLACEMENT_RATE = 0.646;

/** Points awarded per kg of CO₂e saved. Kept in one place so the scale is the same everywhere. */
export const POINTS_PER_KG = 10;

/**
 * Typical weight and emission factor for each sub-category.
 * Weights are rough team estimates for one item, to be checked and sourced.
 */
export const CARBON_FACTORS: Record<Subcategory, CarbonFactor> = {
  Tops: { weightKg: 0.25, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
  Bottoms: { weightKg: 0.5, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
  Outerwear: { weightKg: 1.2, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
  Dresses: { weightKg: 0.4, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
  Footwear: { weightKg: 0.9, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
  Accessories: { weightKg: 0.1, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
  Bags: { weightKg: 0.6, kgCo2ePerKg: PLACEHOLDER_TEXTILE_FACTOR },
};

/** The estimated impact of swapping one item. */
export interface CarbonImpact {
  /** kg CO₂e saved, rounded to 1 decimal place for display. */
  kgCo2e: number;
  /** Points earned for the swap (a whole number). */
  points: number;
}

/**
 * Checks whether a string is a supported sub-category.
 * Item data arrives as plain strings (mock data now, Supabase later), so screens use this
 * before calling the calculator.
 * @param value - any string, e.g. an item's `subcategory` field
 * @returns true if the value is one of {@link SUBCATEGORIES}
 */
export function isSubcategory(value: string): value is Subcategory {
  return (SUBCATEGORIES as readonly string[]).includes(value);
}

/**
 * Estimates the kg CO₂e saved by swapping one item instead of buying it new.
 * @param subcategory - the item's clothing sub-category
 * @param factors - the factor table to use; defaults to the built-in table, and lets
 *   Supabase values be passed in later without changing this function
 * @returns kg CO₂e saved, unrounded (round only for display, so totals stay accurate)
 */
export function estimateCo2e(
  subcategory: Subcategory,
  factors: Record<Subcategory, CarbonFactor> = CARBON_FACTORS,
): number {
  const { weightKg, kgCo2ePerKg } = factors[subcategory];
  return weightKg * kgCo2ePerKg * DISPLACEMENT_RATE;
}

/**
 * Converts kg CO₂e saved into points.
 * @param kgCo2e - kg CO₂e saved
 * @returns a whole number of points; 0 for negative, NaN or infinite input, so bad data
 *   can never award or remove points
 */
export function pointsFromCo2e(kgCo2e: number): number {
  if (!Number.isFinite(kgCo2e) || kgCo2e <= 0) return 0;
  return Math.round(kgCo2e * POINTS_PER_KG);
}

/**
 * Convenience helper for screens: the impact of swapping an item, from its sub-category string.
 * @param subcategory - the item's `subcategory` field
 * @returns the rounded kg CO₂e and points, or null if the sub-category isn't supported
 *   (screens should then hide the estimate rather than show a wrong number)
 */
export function estimateImpact(subcategory: string): CarbonImpact | null {
  if (!isSubcategory(subcategory)) return null;
  const kg = estimateCo2e(subcategory);
  return { kgCo2e: Math.round(kg * 10) / 10, points: pointsFromCo2e(kg) };
}
