// src/api/carbon.ts
/**
 * Data layer for carbon credits. Screens get carbon totals ONLY through these hooks,
 * never from the backend or mock data directly.
 *
 * For now the hooks build the ledger from mock exchanges. When Supabase is ready, only this
 * file changes: fetch rows from `credit_ledger` (or the `campus_impact` view) and keep the
 * same return shape, so screens and their tests don't change.
 */
import { useMemo } from 'react';
import { completedExchanges } from '../constants/mockExchanges';
import {
  buildLedger,
  CampusCarbonSummary,
  summariseCampus,
  summariseForUser,
  UserCarbonSummary,
} from '../lib/ledger';

/** What every data hook returns. `loading` and `error` are always false/null with mock data,
 *  but screens should already handle them so the Supabase switch needs no screen changes. */
export interface DataResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * Carbon totals for one user, for the Profile screen.
 * @param userId - the signed-in user's id
 * @returns the user's points, kg CO₂e and item counts
 */
export function useCarbonSummary(userId: string): DataResult<UserCarbonSummary> {
  const data = useMemo(() => summariseForUser(buildLedger(completedExchanges), userId), [userId]);
  return { data, loading: false, error: null };
}

/**
 * Campus-wide carbon totals, for the admin dashboard.
 * @returns number of exchanges, points awarded and kg CO₂e saved (counted once per exchange)
 */
export function useCampusCarbonSummary(): DataResult<CampusCarbonSummary> {
  const data = useMemo(() => summariseCampus(buildLedger(completedExchanges)), []);
  return { data, loading: false, error: null };
}
