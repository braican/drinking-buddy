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
  if (!record) {
    return {
      ...newItem,
      hads: 1,
      total_rating: checkin.rating,
      average: checkin.rating,
    };
  }

  return {
    ...record,
    hads: record.hads + 1,
    total_rating: record.total_rating + checkin.rating,
    average: (record.total_rating + checkin.rating) / (record.hads + 1),
  };
}
