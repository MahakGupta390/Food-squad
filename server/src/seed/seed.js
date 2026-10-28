import { Restaurant } from '../models/Restaurant.js';
import { RESTAURANTS } from './restaurants.js';

/** Upserts by slug so re-running never duplicates; with force=false it only fills an empty collection. */
export async function seedRestaurants({ force = false } = {}) {
  if (!force && (await Restaurant.estimatedDocumentCount()) > 0) return;
  await Restaurant.bulkWrite(
    RESTAURANTS.map((r, i) => ({
      updateOne: { filter: { slug: r.slug }, update: { $set: { ...r, order: i } }, upsert: true },
    })),
  );
}
