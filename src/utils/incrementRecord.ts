import type { Checkin } from '@types';

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
  const rating = checkin.rating;
  if (!record) {
    return {
      ...newItem,
      hads: 1,
      rated_hads: rating ? 1 : 0,
      total_rating: rating,
      average: checkin.rating,
    };
  }

  return {
    ...record,
    hads: record.hads + 1,
    rated_hads: record.rated_hads + (rating ? 1 : 0),
    total_rating: record.total_rating + rating,
    average: (record.total_rating + checkin.rating) / (record.rated_hads + (rating ? 1 : 0) + 1),
  };
}
