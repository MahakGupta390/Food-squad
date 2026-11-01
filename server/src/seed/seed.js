import { Restaurant } from '../models/Restaurant.js';
import { RESTAURANTS } from './restaurants.js';

/** Upserts by slug so re-running never duplicates; with force=false it only fills an empty collection. */
export async function seedRestaurants() {
  await Restaurant.bulkWrite(
    RESTAURANTS.map((r, i) => ({
      updateOne: {
        filter: { $or: [{ slug: r.slug }, { name: r.name }] },
        update: { $set: { ...r, order: i } },
        upsert: true,
      },
    })),
  );
}
