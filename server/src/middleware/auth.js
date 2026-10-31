import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/http.js';

export const signToken = (user) =>
  jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: '30d' });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

/**
 * Guest-session auth for now: POST /api/session issues a signed token.
 * To move to Auth0, replace this body with express-oauth2-jwt-bearer's
 * jwtCheck + "find or create User by authSub"; everything downstream only
 * relies on `req.user`.
 */
export async function requireUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Sign in first');
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError(401, 'Session expired, please sign in again');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Unknown user');
  req.user = user;
  next();
}
