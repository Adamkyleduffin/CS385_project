// src/constants/mockExchanges.ts
import type { CompletedExchange } from '../lib/ledger';

/**
 * Completed exchanges used until Supabase is connected.
 * The signed-in mock user is `username123` (see `user` in mockData.ts): they have given
 * 7 items and received 2. Kept in its own file so it doesn't clash with edits to mockData.ts.
 */
export const completedExchanges: CompletedExchange[] = [
  {
    id: 'e1',
    itemId: '4',
    giverId: 'username123',
    receiverId: 'randomuser99',
    subcategory: 'Accessories',
    completedAt: '2026-11-02T10:15:00Z',
  },
  {
    id: 'e2',
    itemId: '6',
    giverId: 'username123',
    receiverId: 'randomuser99',
    subcategory: 'Tops',
    completedAt: '2026-11-03T12:00:00Z',
  },
  {
    id: 'e3',
    itemId: 'm3',
    giverId: 'username123',
    receiverId: 'anotheruser03',
    subcategory: 'Outerwear',
    completedAt: '2026-11-05T09:30:00Z',
  },
  {
    id: 'e4',
    itemId: 'm4',
    giverId: 'username123',
    receiverId: 'imsosustainable',
    subcategory: 'Bottoms',
    completedAt: '2026-11-06T14:00:00Z',
  },
  {
    id: 'e5',
    itemId: 'm5',
    giverId: 'username123',
    receiverId: 'reducereuserecycler',
    subcategory: 'Footwear',
    completedAt: '2026-11-08T11:00:00Z',
  },
  {
    id: 'e6',
    itemId: 'm6',
    giverId: 'username123',
    receiverId: 'maynoothstudent26',
    subcategory: 'Dresses',
    completedAt: '2026-11-10T16:45:00Z',
  },
  {
    id: 'e7',
    itemId: 'm7',
    giverId: 'username123',
    receiverId: 'anotheruser03',
    subcategory: 'Bags',
    completedAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'e8',
    itemId: 'm8',
    giverId: 'maynoothstudent26',
    receiverId: 'username123',
    subcategory: 'Outerwear',
    completedAt: '2026-11-13T13:20:00Z',
  },
  {
    id: 'e9',
    itemId: 'm9',
    giverId: 'imsosustainable',
    receiverId: 'username123',
    subcategory: 'Tops',
    completedAt: '2026-11-14T15:10:00Z',
  },
  // Exchange between two other students: counts for campus totals, not for username123.
  {
    id: 'e10',
    itemId: 'm10',
    giverId: 'randomuser99',
    receiverId: 'anotheruser03',
    subcategory: 'Bottoms',
    completedAt: '2026-11-15T10:00:00Z',
  },
];
