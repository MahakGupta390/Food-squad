/**
 * Bill splitting. Pure functions, no DB.
 *
 * Money rules:
 *  - Each cart line is split among its eaters in PAISE (even split, leftover
 *    paise handed out deterministically, so no paisa ever vanishes).
 *  - Tax / fee / discount apply to the whole bill, then the final total
 *    (whole rupees) is allocated to people in proportion to what they ate,
 *    using the largest-remainder method. Shares always sum EXACTLY to total.
 */

/** Split `totalUnits` (integer) evenly across ids; first `rem` ids (sorted) get +1. */
export function splitEven(totalUnits, ids) {
  const sorted = [...ids].sort();
  const n = sorted.length;
  if (n === 0) return {};
  const base = Math.floor(totalUnits / n);
  const rem = totalUnits - base * n;
  const out = {};
  sorted.forEach((id, i) => {
    out[id] = base + (i < rem ? 1 : 0);
  });
  return out;
}

/**
 * Allocate integer `totalUnits` proportionally to integer `weights` ({id: w}).
 * Largest-remainder method; ties broken by id so results are deterministic.
 */
export function allocateProportional(totalUnits, weights) {
  const ids = Object.keys(weights).sort();
  const out = {};
  const sumW = ids.reduce((a, id) => a + weights[id], 0);
  if (sumW === 0) {
    ids.forEach((id) => (out[id] = 0));
    return out;
  }
  let used = 0;
  const remainders = [];
  for (const id of ids) {
    const prod = totalUnits * weights[id]; // integer, far below 2^53 for any real bill
    const rem = prod % sumW;
    const floor = (prod - rem) / sumW;
    out[id] = floor;
    used += floor;
    remainders.push([id, rem]);
  }
  remainders.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  for (let i = 0; i < totalUnits - used; i++) out[remainders[i][0]] += 1;
  return out;
}

/**
 * @param {{price:number, qty:number, eaters:string[]}[]} cart
 * @param {string[]} memberIds
 * @param {{taxRate:number, deliveryFee:number, squadDiscount:number}} pricing
 */
export function computeBill({ cart, memberIds, pricing }) {
  const sub = cart.reduce((a, l) => a + l.price * l.qty, 0);
  const tax = Math.round(sub * pricing.taxRate);
  const fee = sub > 0 ? pricing.deliveryFee : 0;
  const disc = sub > 0 ? Math.min(pricing.squadDiscount, sub + tax + fee) : 0;
  const total = sub + tax + fee - disc;

  const rawPaise = Object.fromEntries(memberIds.map((id) => [id, 0]));
  for (const line of cart) {
    let eaters = (line.eaters || []).filter((id) => id in rawPaise);
    if (eaters.length === 0) eaters = memberIds; // orphaned line: everyone shares
    const parts = splitEven(line.price * line.qty * 100, eaters);
    for (const [id, p] of Object.entries(parts)) rawPaise[id] += p;
  }

  const shares = allocateProportional(total, rawPaise);
  const raw = Object.fromEntries(Object.entries(rawPaise).map(([id, p]) => [id, p / 100]));
  return { sub, tax, fee, disc, total, shares, raw, ratio: sub ? total / sub : 0 };
}
