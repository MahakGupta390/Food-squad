/**
 * Drives the real controllers + real Mongoose documents with the DB calls stubbed,
 * so schema casting, slot mapping, bill math and the order/ledger flow are exercised
 * without needing a running MongoDB.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Room } from '../src/models/Room.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { Debt } from '../src/models/Debt.js';
import { Payment } from '../src/models/Payment.js';
import { User } from '../src/models/User.js';
import { RESTAURANTS } from '../src/seed/restaurants.js';
import * as c from '../src/controllers/app.controller.js';

const id = () => new mongoose.Types.ObjectId();
const chain = (v) => ({
  sort() { return this; },
  limit() { return this; },
  lean: async () => v,
  then: (res, rej) => Promise.resolve(v).then(res, rej),
});

const host = { _id: id(), name: 'Mahak' };
const friend = { _id: id(), name: 'Aman' };
const restaurants = RESTAURANTS.map((r, i) => ({ ...r, order: i }));

let room;
let debts = [];
let payments = [];
const created = { debts: [], payments: [] };

Restaurant.find = () => chain(restaurants);
Restaurant.findOne = ({ slug }) => chain(restaurants.find((r) => r.slug === slug));
Room.findOne = () => chain(room);
Room.find = () => chain(room ? [room.toObject()] : []);
Room.findById = async () => room;
Room.findOneAndUpdate = async (_q, update) => {
  room.set(update.$set);
  return room;
};
Debt.find = (q = {}) => {
  if (q.debtorId && q.creditorId && !q.debtorId.$in) {
    return chain(debts.filter((d) => String(d.debtorId) === String(q.debtorId) && String(d.creditorId) === String(q.creditorId)));
  }
  return chain(debts);
};
Debt.insertMany = async (rows) => {
  created.debts.push(...rows);
  debts = rows.map((r) => ({ ...r }));
};
Payment.find = () => chain(payments);
Payment.create = async (row) => {
  created.payments.push(row);
  payments.push({ ...row, _id: id() });
};
User.find = () => chain([host, friend]);

const call = async (handler, user, body = {}) => {
  const res = { json(v) { this.body = v; } };
  await handler({ user, body, headers: { 'x-room-code': 'BBQ-1234' }, app: { get: () => null } }, res);
  return res.body;
};

test('new user with no room still gets a renderable state', async () => {
  const saved = room;
  room = null;
  const s = await call(c.getState, host);
  assert.equal(s.room, null);
  assert.equal(s.me.name, 'Mahak');
  assert.equal(s.cart.length, 0);
  assert.equal(s.calc.total, 0);
  assert.ok(s.restaurants.length >= 6 && s.menu.length > 0);
  room = saved;
});

test('cart -> eaters -> place order -> debts -> ledger', async () => {
  room = new Room({
    code: 'BBQ-1234',
    restaurantSlug: 'bbq-nation',
    hostId: host._id,
    members: [
      { userId: host._id, name: 'Mahak', slot: 'M' },
      { userId: friend._id, name: 'Aman', slot: 'A' },
    ],
  });
  room.save = async () => room;

  let s = await call(c.addToCart, host, { name: 'Paneer Tikka' });
  assert.equal(s.cart[0].price, 329); // price is from the menu
  assert.deepEqual(s.cart[0].eaters, ['M']);
  const lineId = s.cart[0].lineId;

  s = await call(c.toggleEater, friend, { lineId, member: 'A' });
  assert.deepEqual(s.cart[0].eaters.sort(), ['A', 'M']);
  s = await call(c.updateQty, host, { lineId, delta: 1 });
  assert.equal(s.cart[0].qty, 2);

  // 658 + 5% tax (33) + 50 fee - 100 discount
  assert.equal(s.calc.total, 641);
  assert.equal(s.calc.shares.M + s.calc.shares.A, 641);
  assert.equal(s.members[0].isHost, true);

  await assert.rejects(call(c.placeOrder, friend), /Only the host/);

  s = await call(c.placeOrder, host);
  assert.equal(s.placed, true);
  assert.equal(created.debts.length, 1);
  assert.equal(String(created.debts[0].debtorId), String(friend._id));
  assert.equal(created.debts[0].amount, s.calc.shares.A);

  // placing again is a no-op, not a second charge
  const again = await call(c.placeOrder, host);
  assert.equal(again.placed, true);
  assert.equal(created.debts.length, 1);

  // dashboard for the host: Aman owes them
  const dash = (await call(c.getState, host)).dashboard;
  assert.equal(dash.owed, s.calc.shares.A);
  assert.match(dash.ledger[0].text, /Aman owes you/);

  // host confirms receipt on the room screen
  s = await call(c.confirmPaid, host, { id: 'A' });
  assert.equal(created.payments.length, 1);
  assert.equal(created.payments[0].amount, s.calc.shares.A);
  assert.equal(s.dashboard.owed, 0); // balance cleared (debts - payments)
});

test('agent returns slot-keyed, validated suggestions', async () => {
  room.members[0].diet = ['Veg'];
  const out = await call(c.getAgent, host);
  assert.ok(out.recommendations.length > 0);
  for (const r of out.recommendations) assert.ok(r.eaters.every((s) => ['M', 'A'].includes(s)));
  assert.ok(out.excluded.every((e) => e.dish && e.reason));
});
