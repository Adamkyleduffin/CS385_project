/**
 * Credit ledger rules for the CS385 Student Marketplace.
 *
 * Team decision (CS385-36):
 * - Both the giver and the receiver earn the FULL points for a completed exchange.
 * - Both see the exchange's kg CO₂e on their own Profile, because both took part.
 * - Campus-wide totals count each exchange's kg CO₂e ONCE, so the saving isn't doubled.
 *
 * These are pure functions. The Supabase `complete_exchange()` database function must follow
 * the same rules (see docs/carbon-data-spec.md); these tests are the reference for it.
 */
import { estimateCo2e, isSubcategory, pointsFromCo2e } from './carbon';

/** An exchange where both people have confirmed the hand-over. */
export interface CompletedExchange {
  id: string;
  itemId: string;
  giverId: string;
  receiverId: string;
  /** The item's clothing sub-category, e.g. "Outerwear". */
  subcategory: string;
  /** ISO date-time the exchange was completed. */
  completedAt: string;
}

/** One row of the append-only credit ledger. Matches the `credit_ledger` table. */
export interface LedgerEntry {
  exchangeId: string;
  userId: string;
  role: 'giver' | 'receiver';
  points: number;
  kgCo2e: number;
  createdAt: string;
}

/** A user's carbon totals, as shown on Profile. */
export interface UserCarbonSummary {
  points: number;
  /** kg CO₂e from exchanges the user took part in, rounded to 1 decimal place. */
  kgCo2e: number;
  itemsGiven: number;
  itemsReceived: number;
}

/** Totals across the whole campus, for the admin dashboard. */
export interface CampusCarbonSummary {
  exchanges: number;
  /** All points awarded (giver + receiver). */
  pointsAwarded: number;
  /** kg CO₂e saved, counted once per exchange, rounded to 1 decimal place. */
  kgCo2e: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Works out the ledger rows for one completed exchange: one for the giver, one for the receiver.
 * @param exchange - the completed exchange
 * @returns two entries with the same points and kg CO₂e, or an empty array if the exchange
 *   is invalid (unsupported sub-category, or someone "swapping" with themselves), so bad data
 *   never awards points
 */
export function creditsForExchange(exchange: CompletedExchange): LedgerEntry[] {
  if (!isSubcategory(exchange.subcategory)) return [];
  if (exchange.giverId === exchange.receiverId) return [];

  const kgCo2e = estimateCo2e(exchange.subcategory);
  const points = pointsFromCo2e(kgCo2e);
  const base = { exchangeId: exchange.id, points, kgCo2e, createdAt: exchange.completedAt };

  return [
    { ...base, userId: exchange.giverId, role: 'giver' },
    { ...base, userId: exchange.receiverId, role: 'receiver' },
  ];
}

/**
 * Builds the ledger for many exchanges, keeping only the first entry per (exchange, user).
 * This mirrors the database's UNIQUE (exchange_id, user_id) rule, so a duplicated exchange
 * (e.g. a double tap on "Confirm") can never award points twice.
 * @param exchanges - completed exchanges, possibly containing duplicates
 * @returns the de-duplicated ledger
 */
export function buildLedger(exchanges: CompletedExchange[]): LedgerEntry[] {
  const seen = new Set<string>();
  const ledger: LedgerEntry[] = [];

  for (const exchange of exchanges) {
    for (const entry of creditsForExchange(exchange)) {
      const key = `${entry.exchangeId}:${entry.userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      ledger.push(entry);
    }
  }
  return ledger;
}

/**
 * Totals for one user, for the Profile screen.
 * @param ledger - ledger entries (may include other users' rows)
 * @param userId - whose totals to work out
 * @returns points, kg CO₂e and item counts; all zero for a user with no exchanges
 */
export function summariseForUser(ledger: LedgerEntry[], userId: string): UserCarbonSummary {
  const mine = ledger.filter((e) => e.userId === userId);
  return {
    points: mine.reduce((sum, e) => sum + e.points, 0),
    kgCo2e: round1(mine.reduce((sum, e) => sum + e.kgCo2e, 0)),
    itemsGiven: mine.filter((e) => e.role === 'giver').length,
    itemsReceived: mine.filter((e) => e.role === 'receiver').length,
  };
}

/**
 * Campus-wide totals, for the admin dashboard. kg CO₂e is counted once per exchange,
 * because the giver's and receiver's rows describe the same saving.
 * @param ledger - all ledger entries
 * @returns number of exchanges, total points awarded and kg CO₂e saved
 */
export function summariseCampus(ledger: LedgerEntry[]): CampusCarbonSummary {
  const kgByExchange = new Map<string, number>();
  for (const e of ledger) kgByExchange.set(e.exchangeId, e.kgCo2e);

  return {
    exchanges: kgByExchange.size,
    pointsAwarded: ledger.reduce((sum, e) => sum + e.points, 0),
    kgCo2e: round1([...kgByExchange.values()].reduce((sum, kg) => sum + kg, 0)),
  };
}
