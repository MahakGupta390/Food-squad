import { Restaurant } from '../models/Restaurant.js';
import { Room } from '../models/Room.js';
import { Payment } from '../models/Payment.js';
import { config } from '../config.js';
import { computeBill } from './split.js';
import { getDashboardLedger } from './ledger.service.js';
import { pickSlot } from './room.service.js';

const publicRestaurant = (r) => {
  const menu = r.menu || [];
  const dishes = menu.map((m) => m.name);
  const dishCategories = [...new Set(menu.map((m) => m.category).filter(Boolean))];
  const dishTags = [...new Set(menu.flatMap((m) => m.tags || []).filter(Boolean))];
  const menuSummary = menu.map((m) => `${m.name} ${m.category || ''} ${m.desc || ''}`).join(' ');

  return {
    id: r.slug,
    name: r.name,
    tagline: r.tagline,
    cuisine: r.cuisine,
    rating: r.rating,
    reviews: r.reviews,
    deliveryTime: r.deliveryTime,
    priceForTwo: r.priceForTwo,
    dietary: r.dietary,
    code: r.code,
    dishes,
    dishCategories,
    dishTags,
    menuSummary,
  };
};

const memberView = (m, hostId) => ({
  id: m.slot,
  name: m.name,
  budget: m.budget,
  ready: m.ready,
  diet: m.diet,
  mood: m.mood,
  dislikes: m.dislikes,
  isHost: m.userId.equals(hostId),
});

const ZERO_BILL = { sub: 0, tax: 0, fee: 0, disc: 0, total: 0, shares: {} };

/**
 * One snapshot the whole UI renders from (same shape the mock server returned,
 * plus `me`, `host` and `room`). `room` may be null for a brand-new user.
 */
export async function buildState(user, room) {
  const all = await Restaurant.find().sort({ order: 1 }).lean();
  const restaurants = all.map(publicRestaurant);
  const current = (room && all.find((r) => r.slug === room.restaurantSlug)) || all[0];

  let members;
  let cart = [];
  let calc = ZERO_BILL;
  let paid = {};
  let host;
  let me;

  if (room) {
    const hostFirst = [...room.members].sort(
      (a, b) => Number(b.userId.equals(room.hostId)) - Number(a.userId.equals(room.hostId)),
    );
    members = hostFirst.map((m) => memberView(m, room.hostId));
    const slotOf = Object.fromEntries(room.members.map((m) => [String(m.userId), m.slot]));
    cart = room.cart.map((l) => ({
      lineId: l.lineId,
      name: l.name,
      price: l.price,
      qty: l.qty,
      eaters: l.eaters.map((id) => slotOf[String(id)]).filter(Boolean),
    }));

    if (room.status === 'placed') {
      const shares = Object.fromEntries(room.finalShares.map((s) => [slotOf[String(s.userId)], s.amount]));
      const b = room.bill;
      calc = { sub: b.sub, tax: b.tax, fee: b.fee, disc: b.disc, total: b.total, shares };
      const pays = await Payment.find({ roomId: room._id }, { fromId: 1 }).lean();
      paid = Object.fromEntries(pays.map((p) => [slotOf[String(p.fromId)], true]));
    } else {
      const bill = computeBill({
        cart: room.cart.map((l) => ({ price: l.price, qty: l.qty, eaters: l.eaters.map(String) })),
        memberIds: room.members.map((m) => String(m.userId)),
        pricing: config.pricing,
      });
      calc = {
        sub: bill.sub,
        tax: bill.tax,
        fee: bill.fee,
        disc: bill.disc,
        total: bill.total,
        shares: Object.fromEntries(Object.entries(bill.shares).map(([id, v]) => [slotOf[id], v])),
      };
    }
    host = members.find((m) => m.isHost);
    const mine = room.members.find((x) => x.userId.equals(user._id));
    me = members.find((m) => m.id === mine?.slot);
  } else {
    const slot = pickSlot(user.name, new Set());
    me = { id: slot, name: user.name, budget: 450, ready: false, diet: [], mood: 'Spicy', dislikes: '', isHost: true };
    members = [me];
    host = me;
  }

  const ledger = await getDashboardLedger(user._id);
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const myRooms = await Room.find(
    { 'members.userId': user._id, $or: [{ status: 'open' }, { placedAt: { $gte: since } }] },
    { code: 1, restaurantSlug: 1, hostId: 1, members: 1, cart: 1, status: 1 },
  )
    .sort({ updatedAt: -1 })
    .limit(8)
    .lean();
  const nameBySlug = Object.fromEntries(all.map((r) => [r.slug, r.name]));

  const rooms = myRooms.map((r) => {
    const isHost = String(r.hostId) === String(user._id);
    const hostName = r.members.find((m) => String(m.userId) === String(r.hostId))?.name;
    const step = r.status === 'placed' ? 'settle' : r.cart.length ? 'cart' : 'room';
    return {
      id: r.code,
      code: r.code,
      name: nameBySlug[r.restaurantSlug],
      restId: r.restaurantSlug,
      host: isHost,
      membersCount: r.members.length,
      step,
      note: `${isHost ? 'You are hosting' : `Hosted by ${hostName}`}, ${r.members.length} member${r.members.length === 1 ? '' : 's'}`,
    };
  });

  return {
    me,
    host,
    room: room
      ? {
          code: room.code,
          status: room.status,
          isHost: room.hostId.equals(user._id),
          restaurantSlug: room.restaurantSlug,
        }
      : null,
    restaurants,
    currentRestaurant: { ...publicRestaurant(current), menu: current.menu },
    selectedRestaurantId: room ? current.slug : null,
    members,
    menu: current.menu,
    cart,
    paid,
    placed: room?.status === 'placed',
    calc,
    dashboard: { owed: ledger.owed, owe: ledger.owe, ledger: ledger.ledger, rooms },
  };
}
