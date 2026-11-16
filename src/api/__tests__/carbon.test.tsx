import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { useCampusCarbonSummary, useCarbonSummary } from '../carbon';
import { completedExchanges } from '../../constants/mockExchanges';
import { buildLedger, summariseCampus, summariseForUser } from '../../lib/ledger';

describe('useCarbonSummary', () => {
  it('returns the mock user’s totals from the ledger', async () => {
    const { result } = await renderHook(() => useCarbonSummary('username123'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(
      summariseForUser(buildLedger(completedExchanges), 'username123'),
    );
    expect(result.current.data).toMatchObject({ itemsGiven: 7, itemsReceived: 2 });
    expect(result.current.data.points).toBeGreaterThan(0);
  });

  it('returns zeros for a user with no exchanges', async () => {
    const { result } = await renderHook(() => useCarbonSummary('new-student'));

    expect(result.current.data).toEqual({
      points: 0,
      kgCo2e: 0,
      itemsGiven: 0,
      itemsReceived: 0,
    });
  });
});

describe('useCampusCarbonSummary', () => {
  it('counts every mock exchange once', async () => {
    const { result } = await renderHook(() => useCampusCarbonSummary());

    expect(result.current.data.exchanges).toBe(completedExchanges.length);
    expect(result.current.data).toEqual(summariseCampus(buildLedger(completedExchanges)));
  });
});
