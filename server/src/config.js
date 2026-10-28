import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET && isProd) {
  throw new Error('JWT_SECRET must be set in production');
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || process.env.MONGO_CONNECT_STRING,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Whole-rupee amounts. Kept in one place so the bill math is easy to explain.
  pricing: { taxRate: 0.05, deliveryFee: 50, squadDiscount: 100 },
  limits: { maxMembers: 12, maxQtyPerLine: 20 },
};
