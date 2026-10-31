/**
 * Smart Order Agent, v1: deterministic.
 *
 * Hard constraints (diet, allergies, dislikes, budget) are enforced here, in
 * code, BEFORE any model sees the menu. An optional LLM step can later re-rank
 * the survivors for "soft" taste, but it may only reorder / explain items that
 * passed this filter, and `validateAgentOutput` re-checks whatever it returns.
 */
import { computeBill } from './split.js';

const VEG_FAMILY = new Set(['Veg', 'Vegan', 'Jain']);

const MOOD_HINTS = {
  Spicy: /tikka|65|chili|chilli|spicy|masala|peri|tandoori|seekh|rogan|khowsuey/i,
  'Comfort Food': /dal|biryani|naan|chole|bhature|butter|thali|cheese|roti|phirni/i,
  Light: /salad|bowl|steamed|grilled|sub\b|lemonade|lassi|cooler/i,
  'High Protein': /paneer|chicken|kebab|mutton|egg|dal|protein/i,
};

/** Why can't `member` eat `item`? Returns a short reason, or null if they can. */
export function blockReason(member, item) {
  const diet = member.diet || [];
  const tags = item.tags || [];
  if (diet.some((d) => VEG_FAMILY.has(d)) && !item.veg) return 'non-veg';
  // Fail-safe: these need explicit menu tags. Untagged items count as unverified.
  if (diet.includes('Vegan') && !tags.includes('vegan')) return 'not marked vegan';
  if (diet.includes('Jain') && !tags.includes('jain')) return 'not marked Jain';
  if (diet.includes('Gluten-free') && !tags.includes('gluten-free')) return 'not marked gluten-free';
  if (diet.includes('Egg-free') && tags.includes('egg')) return 'contains egg';
  if (diet.includes('Nut allergy') && tags.includes('nuts')) return 'contains nuts';
  const hay = `${item.name} ${item.desc || ''}`.toLowerCase();
  const bad = String(member.dislikes || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .find((t) => hay.includes(t));
  if (bad) return `dislikes ${bad}`;
  return null;
}

function moodScore(item, members) {
  let s = 0;
  for (const m of members) {
    if (m.mood === 'Sweet') s += item.category === 'Desserts' ? 1 : 0;
    else if (MOOD_HINTS[m.mood]?.test(`${item.name} ${item.desc || ''}`)) s += 1;
  }
  return s;
}

/**
 * @param {{menu:object[], members:{id:string,name:string,budget:number,diet:string[],mood:string,dislikes:string}[], pricing:object, maxItems?:number}} input
 */
export function recommend({ menu, members, pricing, maxItems = 6 }) {
  const ids = members.map((m) => m.id);
  const excluded = [];
  const candidates = [];

  for (const item of menu) {
    const blockers = [];
    const eaters = [];
    for (const m of members) {
      const r = blockReason(m, item);
      if (r) blockers.push({ m, r });
      else eaters.push(m);
    }
    if (eaters.length === 0) {
      excluded.push({
        dish: item.name,
        reason: 'Nobody can eat it · ' + blockers.slice(0, 2).map((b) => `${b.m.name}: ${b.r}`).join(', '),
      });
      continue;
    }
    const perHead = (item.price / eaters.length) * (1 + pricing.taxRate);
    if (perHead > Math.max(...eaters.map((m) => m.budget))) {
      excluded.push({ dish: item.name, reason: 'Over budget cap even when shared' });
      continue;
    }
    candidates.push({ item, eaters, score: moodScore(item, eaters) });
  }

  const chosen = [];
  const coverage = Object.fromEntries(ids.map((id) => [id, 0]));
  const taken = new Set();
  const asLine = (c) => ({ price: c.item.price, qty: 1, eaters: c.eaters.map((m) => m.id) });
  const withinBudget = (lines) => {
    const bill = computeBill({ cart: lines, memberIds: ids, pricing });
    return members.every((m) => bill.shares[m.id] <= m.budget);
  };

  while (chosen.length < maxItems) {
    let best = null;
    let bestVal = -Infinity;
    for (const c of candidates) {
      if (taken.has(c.item.id)) continue;
      const uncovered = c.eaters.filter((m) => coverage[m.id] === 0).length;
      const val = c.score + 3 * uncovered + 0.5 * c.eaters.length - c.item.price / 1000;
      if (val > bestVal && withinBudget([...chosen.map(asLine), asLine(c)])) {
        best = c;
        bestVal = val;
      }
    }
    if (!best) break;
    chosen.push(best);
    taken.add(best.item.id);
    best.eaters.forEach((m) => coverage[m.id]++);
    if (chosen.length >= 4 && ids.every((id) => coverage[id] >= 2)) break;
  }

  const bill = computeBill({ cart: chosen.map(asLine), memberIds: ids, pricing });
  const recommendations = chosen.map((c) => ({
    menuItemId: c.item.id,
    name: c.item.name,
    price: c.item.price,
    veg: c.item.veg,
    eaters: c.eaters.map((m) => m.id),
    tag:
      `${c.item.veg ? 'Veg' : 'Non-veg'} · ` +
      (c.eaters.length === members.length
        ? `Shared by all ${members.length}`
        : c.eaters.length === 1
          ? `${c.eaters[0].name} only`
          : `Shared by ${c.eaters.length}`),
  }));
  const perPerson = Object.fromEntries(
    members.map((m) => [m.id, { amount: bill.shares[m.id], budget: m.budget, over: bill.shares[m.id] > m.budget }]),
  );
  const out = { recommendations, excluded, perPerson, method: 'deterministic-v1' };
  validateAgentOutput(out, menu, members);
  return out;
}

/** Throws if any recommendation breaks a hard constraint or is not on the menu. */
export function validateAgentOutput(out, menu, members) {
  const byId = Object.fromEntries(menu.map((i) => [i.id, i]));
  const byMember = Object.fromEntries(members.map((m) => [m.id, m]));
  for (const r of out.recommendations) {
    const item = byId[r.menuItemId];
    if (!item) throw new Error(`Agent returned unknown item ${r.menuItemId}`);
    if (item.price !== r.price) throw new Error(`Agent changed price of ${item.name}`);
    for (const id of r.eaters) {
      const m = byMember[id];
      const reason = m && blockReason(m, item);
      if (!m || reason) {
        throw new Error(`Agent assigned ${item.name} to ${m?.name ?? id}: ${reason ?? 'unknown member'}`);
      }
    }
  }
  return true;
}
