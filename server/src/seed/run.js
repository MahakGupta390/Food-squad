import mongoose from 'mongoose';
import { config } from '../config.js';
import { seedRestaurants } from './seed.js';

await mongoose.connect(config.mongoUri);
await seedRestaurants({ force: true });
console.log('Restaurants seeded');
await mongoose.disconnect();
