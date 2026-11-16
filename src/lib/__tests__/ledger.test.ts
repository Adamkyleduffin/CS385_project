import { describe, expect, it } from '@jest/globals';
import { estimateCo2e, pointsFromCo2e } from '../carbon';
import {
  buildLedger,
  CompletedExchange,
  creditsForExchange,
  summariseCampus,
  summariseForUser,
} from '../ledger';

const coat: CompletedExchange = {
  id: 'e1',
  itemId: 'i1',
  giverId: 'aisha',
  receiverId: 'barry',
  subcategory: 'Outerwear',
  completedAt: '2026-11-20T10:00:00Z',
};

const top: CompletedExchange = {
  id: 'e2',
  itemId: 'i2',
  giverId: 'barry',
  receiverId: 'sean',
  subcategory: 'Tops',
  completedAt: '2026-11-21T10:00:00Z',
};

describe('creditsForExchange', () => {
  it('creates one entry for the giver and one for the receiver', () => {
    const entries = creditsForExchange(coat);
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => [e.userId, e.role])).toEqual([
      ['aisha', 'giver'],
      ['barry', 'receiver'],
    ]);
  });

  it('gives BOTH people the full points and kg CO₂e', () => {
    const kg = estimateCo2e('Outerwear');
    creditsForExchange(coat).forEach((e) => {
      expect(e.points).toBe(pointsFromCo2e(kg));
      expect(e.kgCo2e).toBeCloseTo(kg);
      expect(e.exchangeId).toBe('e1');
      expect(e.createdAt).toBe(coat.completedAt);
    });
  });

  it('awards nothing for an unsupported sub-category', () => {
    expect(creditsForExchange({ ...coat, subcategory: 'Electrical' })).toEqual([]);
  });

  it('awards nothing when someone swaps with themselves', () => {
    expect(creditsForExchange({ ...coat, receiverId: 'aisha' })).toEqual([]);
  });
});

describe('buildLedger', () => {
  it('awards credits only once when the same exchange appears twice (double tap)', () => {
    const ledger = buildLedger([coat, coat]);
    expect(ledger).toHaveLength(2);
  });

  it('keeps entries for different exchanges', () => {
    expect(buildLedger([coat, top])).toHaveLength(4);
  });

  it('returns an empty ledger for no exchanges', () => {
    expect(buildLedger([])).toEqual([]);
  });
});

describe('summariseForUser', () => {
  const ledger = buildLedger([coat, top]);

  it('adds up points and kg from every exchange the user took part in', () => {
    const barry = summariseForUser(ledger, 'barry');
    const expectedPoints =
      pointsFromCo2e(estimateCo2e('Outerwear')) + pointsFromCo2e(estimateCo2e('Tops'));
    expect(barry.points).toBe(expectedPoints);
    expect(barry.kgCo2e).toBeCloseTo(estimateCo2e('Outerwear') + estimateCo2e('Tops'), 1);
  });

  it('counts items given and received separately', () => {
    expect(summariseForUser(ledger, 'barry')).toMatchObject({ itemsGiven: 1, itemsReceived: 1 });
    expect(summariseForUser(ledger, 'aisha')).toMatchObject({ itemsGiven: 1, itemsReceived: 0 });
  });

  it('rounds kg CO₂e to 1 decimal place', () => {
    const { kgCo2e } = summariseForUser(ledger, 'barry');
    expect(kgCo2e).toBe(Math.round(kgCo2e * 10) / 10);
  });

  it('returns zeros for a user with no exchanges', () => {
    expect(summariseForUser(ledger, 'nobody')).toEqual({
      points: 0,
      kgCo2e: 0,
      itemsGiven: 0,
      itemsReceived: 0,
    });
  });
});

describe('summariseCampus', () => {
  const ledger = buildLedger([coat, top]);

  it('counts each exchange once', () => {
    expect(summariseCampus(ledger).exchanges).toBe(2);
  });

  it('counts kg CO₂e once per exchange, not once per person', () => {
    const expected = estimateCo2e('Outerwear') + estimateCo2e('Tops');
    expect(summariseCampus(ledger).kgCo2e).toBeCloseTo(expected, 1);
  });

  it('adds up all points awarded to givers and receivers', () => {
    const total = ledger.reduce((sum, e) => sum + e.points, 0);
    expect(summariseCampus(ledger).pointsAwarded).toBe(total);
  });

  it('returns zeros for an empty ledger', () => {
    expect(summariseCampus([])).toEqual({ exchanges: 0, pointsAwarded: 0, kgCo2e: 0 });
  });
});
