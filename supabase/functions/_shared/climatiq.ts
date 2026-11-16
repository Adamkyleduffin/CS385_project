/**
 * Climatiq client for the CS385 Student Marketplace (MintedMU).
 *
 * SERVER-SIDE ONLY. This file will run inside the `refresh-carbon-factors` Supabase Edge
 * Function, where the Climatiq API key is stored as a secret. The mobile app must never import
 * it, because anything bundled into the app can be extracted, including the key.
 *
 * It has no imports and doesn't use Deno or React Native APIs, so the same file runs in Jest
 * (tests) and in the Edge Function (Deno). `fetch` is passed in, so tests can fake every
 * Climatiq response without touching the network.
 *
 * Flow: ask Climatiq for the emissions of 1 kg of clothing → that number IS the factor in
 * kg CO₂e per kg → if anything goes wrong, fall back to the factor already in the app
 * (src/lib/carbon.ts), so exchanges can always be completed.
 */

/** Climatiq's estimate endpoint. */
export const CLIMATIQ_ESTIMATE_URL = 'https://api.climatiq.io/data/v1/estimate';

/** The clothing factor we use (see docs/carbon-credits.md). */
export const CLOTHING_ACTIVITY_ID = 'consumer_goods-type_clothing_primary_material_production';

/**
 * Climatiq data version to request. If Climatiq returns a notice about the data version,
 * update this to the latest version shown in the Climatiq documentation.
 */
export const DEFAULT_DATA_VERSION = '^33';

/** Give up on Climatiq after this long, so a slow API never blocks the refresh. */
export const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Plausible range for a clothing factor, in kg CO₂e per kg. The BEIS value is 22.31.
 * Anything outside this range means the wrong factor or unit came back, so we don't trust it.
 */
export const PLAUSIBLE_FACTOR_RANGE = { min: 1, max: 100 } as const;

/** Settings for one Climatiq request. */
export interface ClimatiqConfig {
  /** Climatiq API key (from the Edge Function's secrets, never from the app). */
  apiKey: string | undefined;
  /** The fetch function to use. Defaults to the global fetch; tests pass a fake. */
  fetchFn?: typeof fetch;
  activityId?: string;
  region?: string;
  dataVersion?: string;
  timeoutMs?: number;
}

/** Why a Climatiq request failed. Each reason is logged so problems are easy to spot. */
export type ClimatiqFailure =
  | 'missing_key' // no API key configured
  | 'unauthorized' // 401/403: wrong or expired key
  | 'rate_limited' // 429: too many requests
  | 'bad_request' // other 4xx: e.g. unknown activity ID or data version
  | 'server_error' // 5xx: Climatiq is having problems
  | 'timeout' // no answer within timeoutMs
  | 'network' // couldn't reach Climatiq at all
  | 'bad_response'; // answered, but not with a usable kg CO₂e value

/** The result of asking Climatiq for the clothing factor. */
export type ClimatiqFactorResult =
  | {
      ok: true;
      /** kg CO₂e per kg of clothing. */
      kgCo2ePerKg: number;
      /** Climatiq's factor ID, recorded so we know exactly which factor was used. */
      factorId: string | null;
      /** Original source, e.g. "BEIS". */
      source: string | null;
      year: number | null;
    }
  | { ok: false; reason: ClimatiqFailure; status?: number };

/** The parts of Climatiq's estimate response that we use. */
interface EstimateResponse {
  co2e?: unknown;
  co2e_unit?: unknown;
  emission_factor?: { id?: unknown; source?: unknown; year?: unknown };
}

/**
 * Turns a non-OK HTTP status into a failure reason.
 * @param status - the HTTP status code
 * @returns the matching {@link ClimatiqFailure}
 */
export function failureForStatus(status: number): ClimatiqFailure {
  if (status === 401 || status === 403) return 'unauthorized';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server_error';
  return 'bad_request';
}

/**
 * Reads the factor out of a Climatiq estimate response for 1 kg.
 * @param body - the parsed JSON response
 * @returns the factor and its metadata, or a `bad_response` failure if the value is missing,
 *   not in kg, or outside {@link PLAUSIBLE_FACTOR_RANGE}
 */
export function parseEstimate(body: unknown): ClimatiqFactorResult {
  const data = (body ?? {}) as EstimateResponse;
  const value = data.co2e;

  if (typeof value !== 'number' || !Number.isFinite(value) || data.co2e_unit !== 'kg') {
    return { ok: false, reason: 'bad_response' };
  }
  if (value < PLAUSIBLE_FACTOR_RANGE.min || value > PLAUSIBLE_FACTOR_RANGE.max) {
    return { ok: false, reason: 'bad_response' };
  }

  const ef = data.emission_factor ?? {};
  return {
    ok: true,
    kgCo2ePerKg: value,
    factorId: typeof ef.id === 'string' ? ef.id : null,
    source: typeof ef.source === 'string' ? ef.source : null,
    year: typeof ef.year === 'number' ? ef.year : null,
  };
}

/**
 * Asks Climatiq for the emissions of 1 kg of clothing, which gives the factor in
 * kg CO₂e per kg. Never throws: every problem comes back as `{ ok: false, reason }`.
 * @param config - API key, fetch function and optional overrides
 * @returns the factor, or the reason it couldn't be fetched
 */
export async function fetchClothingFactor(config: ClimatiqConfig): Promise<ClimatiqFactorResult> {
  if (!config.apiKey) return { ok: false, reason: 'missing_key' };

  const fetchFn = config.fetchFn ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetchFn(CLIMATIQ_ESTIMATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: config.activityId ?? CLOTHING_ACTIVITY_ID,
          region: config.region ?? 'GB',
          data_version: config.dataVersion ?? DEFAULT_DATA_VERSION,
        },
        parameters: { weight: 1, weight_unit: 'kg' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { ok: false, reason: failureForStatus(response.status), status: response.status };
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { ok: false, reason: 'bad_response' };
    }
    return parseEstimate(body);
  } catch (error) {
    // An aborted request means our timeout fired; anything else is a network failure.
    const aborted = error instanceof Error && error.name === 'AbortError';
    return { ok: false, reason: aborted ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** One row for the `carbon_factors` table (see docs/carbon-data-spec.md). */
export interface CarbonFactorRow {
  subcategory: string;
  weight_kg: number;
  kg_co2e_per_kg: number;
  source: 'Climatiq' | 'fallback';
  climatiq_activity_id: string | null;
}

/**
 * Builds the `carbon_factors` rows from a Climatiq result, falling back to the app's
 * built-in factor when Climatiq failed. The Edge Function upserts these rows.
 * @param weights - typical weight in kg for each sub-category (CARBON_FACTORS in src/lib/carbon.ts)
 * @param result - what {@link fetchClothingFactor} returned
 * @param fallbackFactor - the factor to use if Climatiq failed (CLOTHING_KG_CO2E_PER_KG)
 * @returns one row per sub-category, all using the same factor and source
 */
export function buildFactorRows(
  weights: Record<string, number>,
  result: ClimatiqFactorResult,
  fallbackFactor: number,
): CarbonFactorRow[] {
  const fromClimatiq = result.ok;
  const factor = result.ok ? result.kgCo2ePerKg : fallbackFactor;

  return Object.entries(weights).map(([subcategory, weightKg]) => ({
    subcategory,
    weight_kg: weightKg,
    kg_co2e_per_kg: factor,
    source: fromClimatiq ? 'Climatiq' : 'fallback',
    climatiq_activity_id: fromClimatiq ? CLOTHING_ACTIVITY_ID : null,
  }));
}
