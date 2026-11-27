import type { Checkin } from '#types';

type Totals = { hads?: number; rated_hads?: number; total_rating?: number };

/**
 * Average rating from running totals. Unrated checkins count toward hads but not the
 * average, so divide by rated_hads.
 */
export function averageRating(totals: Totals): number | null {
  return totals.rated_hads ? (totals.total_rating ?? 0) / totals.rated_hads : null;
}

/**
 * Increment a record's hads, total_rating, and average.
 *
 * @param record The record to increment.
 * @param newItem The new item to add to the record.
 * @param {Checkin} checkin The checkin to use for the increment.
 *
 * @return The incremented record.
 */
export function incrementRecord<T>(record, newItem: T, checkin: Checkin): T {
  const rating = checkin.rating || 0;
  const base = record ?? { ...newItem, hads: 0, rated_hads: 0, total_rating: 0 };

  const totals = {
    hads: (base.hads ?? 0) + 1,
    rated_hads: (base.rated_hads ?? 0) + (rating ? 1 : 0),
    total_rating: (base.total_rating ?? 0) + rating,
  };

  return { ...base, ...totals, average: averageRating(totals) };
}
