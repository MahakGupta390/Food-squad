import crypto from 'node:crypto';
import { Room } from '../models/Room.js';
import { Restaurant } from '../models/Restaurant.js';
import { config } from '../config.js';
import { HttpError } from '../utils/http.js';

export const DIET_OPTIONS = ['Veg', 'Non-veg', 'Vegan', 'Jain', 'Egg-free', 'Gluten-free', 'Nut allergy'];
export const MOOD_OPTIONS = ['Spicy', 'Comfort Food', 'Light', 'Sweet', 'High Protein'];

/** Short avatar label unique inside a room: first letter, then M2, M3... */
export function pickSlot(name, taken) {
  const base = (name.match(/\p{L}/u)?.[0] ?? 'U').toUpperCase();
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(base + n)) n++;
  return base + n;
}

const memberFor = (user, room) => ({
  userId: user._id,
  name: user.name,
  slot: pickSlot(user.name, new Set((room?.members ?? []).map((m) => m.slot))),
});

export async function createRoom(user, restaurant) {
  const prefix = restaurant.code.split('-')[0];
  for (let i = 0; i < 6; i++) {
    const code = `${prefix}-${crypto.randomInt(1000, 10000)}`;
    try {
      return await Room.create({
        code,
        restaurantSlug: restaurant.slug,
        hostId: user._id,
        members: [memberFor(user, null)],
      });
    } catch (e) {
      if (e.code === 11000) continue; // code collision, roll again
      throw e;
    }
  }
  throw new HttpError(503, 'Could not allocate a room code, try again');
}

export async function joinRoom(user, rawCode) {
  let code = String(rawCode || '').trim();
  const match = code.match(/(?:join=|room=|\/)([A-Z]{3}-\d{4})/i) || code.match(/([A-Z]{3}-\d{4})/i);
  if (match) code = match[1].toUpperCase();
  else code = code.toUpperCase();

  if (!code) throw new HttpError(400, 'Enter a valid room code (e.g. BBQ-4821)');

  // 1. Direct match on existing room code
  let targetRoom = await Room.findOne({ code });

  // 2. Fallback: if not found by room code, check if it matches a restaurant code or prefix
  if (!targetRoom) {
    const restaurant = await Restaurant.findOne({
      $or: [{ code }, { code: new RegExp('^' + code.split('-')[0], 'i') }, { slug: code.toLowerCase() }],
    });
    if (restaurant) {
      targetRoom = await Room.findOne({ restaurantSlug: restaurant.slug, status: 'open' }).sort({ updatedAt: -1 });
      if (!targetRoom) {
        return await createRoom(user, restaurant);
      }
      code = targetRoom.code;
    }
  }

  if (!targetRoom) throw new HttpError(404, `Room "${code}" not found. Check the code or pick a restaurant to start one.`);

  const room = await mutateRoom(code, (r) => {
    if (r.members.some((m) => m.userId.equals(user._id))) return; // already in: idempotent
    if (r.status !== 'open') throw new HttpError(409, 'This order was already placed');
    if (r.members.length >= config.limits.maxMembers) throw new HttpError(409, 'Room is full');
    r.members.push(memberFor(user, r));
  });
  return room;
}

/**
 * Load -> change -> save with optimistic concurrency. If two people edit the
 * same room at the same instant, the loser transparently retries on fresh data.
 */
export async function mutateRoom(code, fn, tries = 5) {
  for (let i = 0; i < tries; i++) {
    const room = await Room.findOne({ code });
    if (!room) throw new HttpError(404, 'Room not found');
    await fn(room);
    try {
      await room.save();
      return room;
    } catch (e) {
      if (e.name === 'VersionError' && i < tries - 1) continue;
      throw e;
    }
  }
}

/** The room the client is looking at: x-room-code header if they belong to it, else their latest. */
export async function findActiveRoom(user, headerCode) {
  const code = headerCode ? String(headerCode).trim().toUpperCase() : null;
  if (code) {
    const room = await Room.findOne({ code, 'members.userId': user._id });
    if (room) return room;
  }
  return Room.findOne({ 'members.userId': user._id }).sort({ updatedAt: -1 });
}

export async function requireActiveRoom(req) {
  const room = await findActiveRoom(req.user, req.headers['x-room-code']);
  if (!room) throw new HttpError(404, 'Start or join a room first');
  return room;
}

export const getRestaurant = async (slug) => {
  const r = await Restaurant.findOne({ slug }).lean();
  if (!r) throw new HttpError(404, 'Restaurant not found');
  return r;
};

export const isMember = (room, user) => room.members.some((m) => m.userId.equals(user._id));
export const memberBySlot = (room, slot) => room.members.find((m) => m.slot === slot);
export function assertOpen(room) {
  if (room.status !== 'open') throw new HttpError(409, 'This order is already placed');
}
export function assertMember(room, user) {
  if (!isMember(room, user)) throw new HttpError(403, 'You are not in this room');
}
export function assertHost(room, user) {
  if (!room.hostId.equals(user._id)) throw new HttpError(403, 'Only the host can do this');
}
