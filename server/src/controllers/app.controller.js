import { randomUUID } from 'node:crypto';
import { Room } from '../models/Room.js';
import { Debt } from '../models/Debt.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { config } from '../config.js';
import { signToken } from '../middleware/auth.js';
import { HttpError } from '../utils/http.js';
import { computeBill } from '../services/split.js';
import { recommend } from '../services/agent.js';
import { buildState } from '../services/state.service.js';
import { pairOutstanding, settleLedgerItem } from '../services/ledger.service.js';
import {
  DIET_OPTIONS,
  MOOD_OPTIONS,
  assertHost,
  assertMember,
  assertOpen,
  createRoom,
  findActiveRoom,
  getRestaurant,
  joinRoom,
  memberBySlot,
  mutateRoom,
  requireActiveRoom,
} from '../services/room.service.js';

/* ---------- helpers ---------- */

async function send(req, res, room, { broadcast = true } = {}) {
  res.json(await buildState(req.user, room));
  if (broadcast && room) req.app.get('io')?.to(room.code).emit('room:update', { code: room.code });
}

const findLine = (room, { lineId, index }) => {
  const line = lineId ? room.cart.find((l) => l.lineId === lineId) : room.cart[Number(index)];
  if (!line) throw new HttpError(404, 'That item is no longer in the cart');
  return line;
};

const agentInput = (room) =>
  room.members.map((m) => ({
    id: String(m.userId),
    name: m.name,
    budget: m.budget,
    diet: m.diet,
    mood: m.mood,
    dislikes: m.dislikes,
  }));

/* ---------- session & state ---------- */

export async function createSession(req, res) {
  const name = String(req.body?.name ?? '').trim().slice(0, 40);
  if (!name) throw new HttpError(400, 'Please enter your name');
  const user = await User.create({ name });
  res.status(201).json({ token: signToken(user), user: { id: String(user._id), name: user.name } });
}

export async function getState(req, res) {
  const room = await findActiveRoom(req.user, req.headers['x-room-code']);
  await send(req, res, room, { broadcast: false });
}

/* ---------- rooms ---------- */

export async function selectRestaurant(req, res) {
  const restaurant = await getRestaurant(String(req.body?.id ?? ''));
  let room = await findActiveRoom(req.user, req.headers['x-room-code']);
  const reusable = room && room.status === 'open' && room.hostId.equals(req.user._id) && room.cart.length === 0;
  if (reusable) {
    if (room.restaurantSlug !== restaurant.slug) {
      room = await mutateRoom(room.code, (r) => {
        r.restaurantSlug = restaurant.slug;
      });
    }
  } else {
    room = await createRoom(req.user, restaurant);
  }
  await send(req, res, room);
}

export async function join(req, res) {
  const room = await joinRoom(req.user, req.body?.code);
  await send(req, res, room);
}

export async function savePrefs(req, res) {
  const room = await requireActiveRoom(req);
  const { budget, diet, mood, dislikes } = req.body ?? {};
  const updated = await mutateRoom(room.code, (r) => {
    assertOpen(r);
    const me = r.members.find((m) => m.userId.equals(req.user._id));
    if (!me) throw new HttpError(403, 'You are not in this room');
    if (Number.isFinite(budget)) me.budget = Math.min(10000, Math.max(50, Math.round(budget)));
    if (Array.isArray(diet)) me.diet = [...new Set(diet.filter((d) => DIET_OPTIONS.includes(d)))];
    if (MOOD_OPTIONS.includes(mood)) me.mood = mood;
    if (typeof dislikes === 'string') me.dislikes = dislikes.trim().slice(0, 120);
    me.ready = true;
  });
  await send(req, res, updated);
}

/* ---------- cart ---------- */

export async function addToCart(req, res) {
  const room = await requireActiveRoom(req);
  const restaurant = await getRestaurant(room.restaurantSlug);
  const { name, menuItemId } = req.body ?? {};
  const item = restaurant.menu.find((m) => (menuItemId ? m.id === menuItemId : m.name === name));
  if (!item) throw new HttpError(404, 'Item not on this menu');
  const updated = await mutateRoom(room.code, (r) => {
    assertOpen(r);
    assertMember(r, req.user);
    const line = r.cart.find((l) => l.menuItemId === item.id);
    if (line) {
      if (line.qty >= config.limits.maxQtyPerLine) throw new HttpError(400, 'That is plenty of one dish');
      line.qty += 1;
    } else {
      // price comes from the menu, never from the client
      r.cart.push({ lineId: randomUUID(), menuItemId: item.id, name: item.name, price: item.price, qty: 1, eaters: [req.user._id] });
    }
  });
  await send(req, res, updated);
}

export async function updateQty(req, res) {
  const room = await requireActiveRoom(req);
  const delta = Number(req.body?.delta) > 0 ? 1 : -1;
  const updated = await mutateRoom(room.code, (r) => {
    assertOpen(r);
    assertMember(r, req.user);
    const line = findLine(r, req.body ?? {});
    if (delta > 0 && line.qty >= config.limits.maxQtyPerLine) throw new HttpError(400, 'That is plenty of one dish');
    line.qty += delta;
    if (line.qty < 1) r.cart.splice(r.cart.indexOf(line), 1);
  });
  await send(req, res, updated);
}

export async function toggleEater(req, res) {
  const room = await requireActiveRoom(req);
  const updated = await mutateRoom(room.code, (r) => {
    assertOpen(r);
    assertMember(r, req.user);
    const target = memberBySlot(r, String(req.body?.member ?? ''));
    if (!target) throw new HttpError(404, 'Unknown member');
    const line = findLine(r, req.body ?? {});
    const has = line.eaters.some((e) => e.equals(target.userId));
    if (has) {
      if (line.eaters.length > 1) line.eaters = line.eaters.filter((e) => !e.equals(target.userId));
    } else {
      line.eaters.push(target.userId);
    }
  });
  await send(req, res, updated);
}

/* ---------- agent ---------- */

const toClientAgent = (out, room) => {
  const slotOf = Object.fromEntries(room.members.map((m) => [String(m.userId), m.slot]));
  return {
    method: out.method,
    recommendations: out.recommendations.map((r) => ({ ...r, eaters: r.eaters.map((id) => slotOf[id]) })),
    excluded: out.excluded,
    perPerson: Object.fromEntries(Object.entries(out.perPerson).map(([id, v]) => [slotOf[id], v])),
  };
};

export async function getAgent(req, res) {
  const room = await requireActiveRoom(req);
  const restaurant = await getRestaurant(room.restaurantSlug);
  const out = recommend({ menu: restaurant.menu, members: agentInput(room), pricing: config.pricing });
  res.json(toClientAgent(out, room));
}

export async function acceptAgent(req, res) {
  const room = await requireActiveRoom(req);
  assertHost(room, req.user);
  const restaurant = await getRestaurant(room.restaurantSlug);
  const out = recommend({ menu: restaurant.menu, members: agentInput(room), pricing: config.pricing });
  const updated = await mutateRoom(room.code, (r) => {
    assertOpen(r);
    for (const rec of out.recommendations) {
      if (r.cart.some((l) => l.menuItemId === rec.menuItemId)) continue;
      r.cart.push({ lineId: randomUUID(), menuItemId: rec.menuItemId, name: rec.name, price: rec.price, qty: 1, eaters: rec.eaters });
    }
  });
  await send(req, res, updated);
}

/* ---------- order & settlement ---------- */

export async function placeOrder(req, res) {
  const room = await requireActiveRoom(req);
  assertHost(room, req.user);
  if (room.status === 'placed') return send(req, res, room, { broadcast: false }); // idempotent
  if (!room.cart.length) throw new HttpError(400, 'Add something to the cart first');

  const bill = computeBill({
    cart: room.cart.map((l) => ({ price: l.price, qty: l.qty, eaters: l.eaters.map(String) })),
    memberIds: room.members.map((m) => String(m.userId)),
    pricing: config.pricing,
  });

  // Atomic open -> placed transition. Only one request can win; the version check
  // also fails if somebody edited the cart after we read it.
  const placed = await Room.findOneAndUpdate(
    { _id: room._id, status: 'open', __v: room.__v },
    {
      $set: {
        status: 'placed',
        placedAt: new Date(),
        bill: { sub: bill.sub, tax: bill.tax, fee: bill.fee, disc: bill.disc, total: bill.total },
        finalShares: Object.entries(bill.shares).map(([userId, amount]) => ({ userId, amount })),
        placedItems: room.cart.map((l) => ({ name: l.name, qty: l.qty })),
      },
      $inc: { __v: 1 },
    },
    { new: true },
  );
  if (!placed) {
    const fresh = await Room.findById(room._id);
    if (fresh?.status === 'placed') return send(req, res, fresh);
    throw new HttpError(409, 'The cart changed while placing, please review and try again');
  }

  const restaurant = await getRestaurant(room.restaurantSlug);
  const debts = room.members
    .filter((m) => !m.userId.equals(room.hostId))
    .map((m) => ({
      roomId: room._id,
      roomCode: room.code,
      restaurantName: restaurant.name,
      debtorId: m.userId,
      creditorId: room.hostId,
      amount: bill.shares[String(m.userId)],
    }))
    .filter((d) => d.amount > 0);
  try {
    await Debt.insertMany(debts, { ordered: false });
  } catch (e) {
    const onlyDuplicates = e?.code === 11000 || (Array.isArray(e?.writeErrors) && e.writeErrors.every((w) => w.code === 11000));
    if (!onlyDuplicates) throw e;
  }
  await send(req, res, placed);
}

/** Host confirms that a member's share has been received (room screen). */
export async function confirmPaid(req, res) {
  const room = await requireActiveRoom(req);
  assertHost(room, req.user);
  if (room.status !== 'placed') throw new HttpError(409, 'Place the order first');
  const member = memberBySlot(room, String(req.body?.id ?? ''));
  if (!member || member.userId.equals(room.hostId)) throw new HttpError(404, 'Unknown member');
  const share = room.finalShares.find((s) => s.userId.equals(member.userId))?.amount ?? 0;
  // Never let room confirmation + the ledger "Settle" button pay the same money twice.
  const outstanding = await pairOutstanding(member.userId, room.hostId);
  const amount = Math.min(share, outstanding);
  if (amount > 0) {
    try {
      await Payment.create({ fromId: member.userId, toId: room.hostId, amount, roomId: room._id, source: 'room' });
    } catch (e) {
      if (e.code !== 11000) throw e; // already confirmed: idempotent
    }
  }
  await send(req, res, room);
}

export async function settleLedger(req, res) {
  await settleLedgerItem(req.user, String(req.body?.id ?? ''));
  const room = await findActiveRoom(req.user, req.headers['x-room-code']);
  await send(req, res, room);
}
