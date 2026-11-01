import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET && isProd) {
  throw new Error('JWT_SECRET must be set in production');
}

// Safely parse CLIENT_URL environment variable and strip trailing slashes
const rawOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Explicitly include production domain + dev origins
const allowedOrigins = Array.from(
  new Set([
    ...rawOrigins,
    'https://food-squad.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ])
);

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || process.env.MONGO_CONNECT_STRING,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  clientOrigins: allowedOrigins,
  // Whole-rupee amounts. Kept in one place so the bill math is easy to explain.
  pricing: { taxRate: 0.05, deliveryFee: 50, squadDiscount: 100 },
  limits: { maxMembers: 12, maxQtyPerLine: 20 },
};