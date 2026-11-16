import { describe, expect, it, jest } from '@jest/globals';
import {
  buildFactorRows,
  CLIMATIQ_ESTIMATE_URL,
  CLOTHING_ACTIVITY_ID,
  ClimatiqFactorResult,
  failureForStatus,
  fetchClothingFactor,
  parseEstimate,
} from '../climatiq';
import { CARBON_FACTORS, CLOTHING_KG_CO2E_PER_KG } from '../../../../src/lib/carbon';
// Example response built from Climatiq's documented format. Replace it with a real recorded
// response once the team has an API key (see docs/carbon-credits.md).
import fixture from './__fixtures__/climatiq-estimate-clothing.json';

/** A fake fetch that answers with the given status and JSON body. */
function fakeFetch(status: number, body: unknown = {}) {
  return jest.fn(
    async () => new Response(JSON.stringify(body), { status }),
  ) as unknown as typeof fetch;
}

/** A fake fetch that never answers until it's aborted, to test the timeout. */
const hangingFetch = ((_url: string, init?: RequestInit) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      reject(error);
    });
  })) as unknown as typeof fetch;

const weights = Object.fromEntries(
  Object.entries(CARBON_FACTORS).map(([subcategory, f]) => [subcategory, f.weightKg]),
);

describe('fetchClothingFactor', () => {
  it('returns the factor and metadata from a successful response', async () => {
    const result = await fetchClothingFactor({
      apiKey: 'test-key',
      fetchFn: fakeFetch(200, fixture),
    });

    expect(result).toEqual({
      ok: true,
      kgCo2ePerKg: 22.31,
      factorId: 'b510ce09-872e-82c3-8cbe-823f1ce5ecbc',
      source: 'BEIS',
      year: 2026,
    });
  });

  it('sends a correct request: POST, bearer key, clothing activity, 1 kg', async () => {
    const fetchFn = fakeFetch(200, fixture);
    await fetchClothingFactor({ apiKey: 'test-key', fetchFn });

    const [url, init] = (fetchFn as unknown as jest.Mock).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(url).toBe(CLIMATIQ_ESTIMATE_URL);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key');
    expect(body.emission_factor.activity_id).toBe(CLOTHING_ACTIVITY_ID);
    expect(body.emission_factor.region).toBe('GB');
    expect(body.parameters).toEqual({ weight: 1, weight_unit: 'kg' });
  });

  it('does not call Climatiq at all when there is no API key', async () => {
    const fetchFn = fakeFetch(200, fixture);
    const result = await fetchClothingFactor({ apiKey: undefined, fetchFn });

    expect(result).toEqual({ ok: false, reason: 'missing_key' });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [429, 'rate_limited'],
    [400, 'bad_request'],
    [500, 'server_error'],
    [503, 'server_error'],
  ])('reports HTTP %i as %s', async (status, reason) => {
    const result = await fetchClothingFactor({ apiKey: 'k', fetchFn: fakeFetch(status) });
    expect(result).toEqual({ ok: false, reason, status });
  });

  it('reports a timeout when Climatiq takes too long', async () => {
    const result = await fetchClothingFactor({ apiKey: 'k', fetchFn: hangingFetch, timeoutMs: 20 });
    expect(result).toEqual({ ok: false, reason: 'timeout' });
  });

  it('reports a network failure when Climatiq cannot be reached', async () => {
    const fetchFn = (async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    expect(await fetchClothingFactor({ apiKey: 'k', fetchFn })).toEqual({
      ok: false,
      reason: 'network',
    });
  });

  it('reports a bad response when the body is not JSON', async () => {
    const fetchFn = (async () =>
      new Response('<html>oops</html>', { status: 200 })) as unknown as typeof fetch;
    expect(await fetchClothingFactor({ apiKey: 'k', fetchFn })).toEqual({
      ok: false,
      reason: 'bad_response',
    });
  });
});

describe('parseEstimate', () => {
  it('accepts the example response (fixture)', () => {
    expect(parseEstimate(fixture).ok).toBe(true);
  });

  it.each([
    ['missing co2e', { co2e_unit: 'kg' }],
    ['co2e as text', { co2e: '22.31', co2e_unit: 'kg' }],
    ['wrong unit', { co2e: 22.31, co2e_unit: 't' }],
    ['implausibly small', { co2e: 0.02231, co2e_unit: 'kg' }],
    ['implausibly large', { co2e: 22310, co2e_unit: 'kg' }],
    ['null body', null],
  ])('rejects %s', (_label, body) => {
    expect(parseEstimate(body)).toEqual({ ok: false, reason: 'bad_response' });
  });

  it('copes with missing emission factor metadata', () => {
    expect(parseEstimate({ co2e: 20, co2e_unit: 'kg' })).toEqual({
      ok: true,
      kgCo2ePerKg: 20,
      factorId: null,
      source: null,
      year: null,
    });
  });
});

describe('failureForStatus', () => {
  it('treats unknown 4xx codes as a bad request', () => {
    expect(failureForStatus(404)).toBe('bad_request');
  });
});

describe('buildFactorRows', () => {
  it('uses the Climatiq factor and records the activity ID when Climatiq succeeded', () => {
    const result: ClimatiqFactorResult = parseEstimate({ ...fixture, co2e: 25 });
    const rows = buildFactorRows(weights, result, CLOTHING_KG_CO2E_PER_KG);

    expect(rows).toHaveLength(Object.keys(CARBON_FACTORS).length);
    rows.forEach((row) => {
      expect(row.kg_co2e_per_kg).toBe(25);
      expect(row.source).toBe('Climatiq');
      expect(row.climatiq_activity_id).toBe(CLOTHING_ACTIVITY_ID);
    });
  });

  it('falls back to the app’s built-in factor when Climatiq failed', () => {
    const rows = buildFactorRows(
      weights,
      { ok: false, reason: 'timeout' },
      CLOTHING_KG_CO2E_PER_KG,
    );

    rows.forEach((row) => {
      expect(row.kg_co2e_per_kg).toBe(CLOTHING_KG_CO2E_PER_KG);
      expect(row.source).toBe('fallback');
      expect(row.climatiq_activity_id).toBeNull();
    });
  });

  it('keeps each sub-category’s weight', () => {
    const rows = buildFactorRows(
      weights,
      { ok: false, reason: 'network' },
      CLOTHING_KG_CO2E_PER_KG,
    );
    const outerwear = rows.find((r) => r.subcategory === 'Outerwear');
    expect(outerwear?.weight_kg).toBe(CARBON_FACTORS.Outerwear.weightKg);
  });
});
