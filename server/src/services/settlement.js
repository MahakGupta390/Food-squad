/**
 * Debt simplification: given who owes whom, find a small set of payments that
 * clears everybody.
 *
 * Minimising the number of payments is NP-hard in general (it equals finding
 * the maximum number of disjoint zero-sum groups of balances). We:
 *   1. net everything into one balance per person,
 *   2. split people into components of the "who currently owes whom" graph
 *      (so strangers are never asked to pay each other),
 *   3. solve each component exactly with a bitmask DP when it has
 *      <= EXACT_LIMIT people, otherwise greedily.
 * A zero-sum group of k people needs k-1 payments, so
 * payments = (people with a balance) - (max number of zero-sum groups).
 */

export const EXACT_LIMIT = 14;

/** edges: [{from, to, amount}] meaning `from` owes `to` `amount` (integer rupees). */
export function simplifyDebts(edges) {
  const balance = {};
  const pairNet = {};
  for (const { from, to, amount } of edges) {
    if (!amount || from === to) continue;
    balance[to] = (balance[to] || 0) + amount;
    balance[from] = (balance[from] || 0) - amount;
    const [lo, hi] = from < to ? [from, to] : [to, from];
    const key = lo + '|' + hi;
    pairNet[key] = (pairNet[key] || 0) + (from === lo ? amount : -amount);
  }

  // Union-find over pairs that still have a non-zero net between them.
  const parent = {};
  const find = (x) => {
    parent[x] ??= x;
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (const [key, net] of Object.entries(pairNet)) {
    if (net === 0) continue;
    const [a, b] = key.split('|');
    parent[find(a)] = find(b);
  }

  const components = {};
  for (const [id, bal] of Object.entries(balance)) {
    if (bal === 0) continue;
    (components[find(id)] ??= []).push({ id, bal });
  }

  const txns = [];
  for (const root of Object.keys(components).sort()) {
    const entries = components[root].sort((a, b) => (a.id < b.id ? -1 : 1));
    const groups = entries.length <= EXACT_LIMIT ? exactGroups(entries) : [entries];
    for (const g of groups) txns.push(...settleGroupGreedy(g));
  }
  return txns;
}

/** Order entries so the number of zero-sum prefixes is maximal, then cut into groups. */
function exactGroups(entries) {
  const n = entries.length;
  if (n <= 2) return [entries];
  const size = 1 << n;
  const sum = new Int32Array(size);
  for (let m = 1; m < size; m++) {
    const low = m & -m;
    sum[m] = sum[m ^ low] + entries[31 - Math.clz32(low)].bal;
  }
  const dp = new Int16Array(size);
  const pick = new Int8Array(size);
  for (let m = 1; m < size; m++) {
    let best = -1;
    let bi = 0;
    for (let i = 0; i < n; i++) {
      if (!(m & (1 << i))) continue;
      const v = dp[m ^ (1 << i)];
      if (v > best) {
        best = v;
        bi = i;
      }
    }
    dp[m] = best + (sum[m] === 0 ? 1 : 0);
    pick[m] = bi;
  }
  const order = [];
  for (let m = size - 1; m; m ^= 1 << pick[m]) order.push(pick[m]);
  order.reverse();

  const groups = [];
  let cur = [];
  let run = 0;
  for (const i of order) {
    cur.push(entries[i]);
    run += entries[i].bal;
    if (run === 0) {
      groups.push(cur);
      cur = [];
    }
  }
  return groups;
}

function settleGroupGreedy(group) {
  const cred = group.filter((e) => e.bal > 0).map((e) => ({ id: e.id, amt: e.bal }));
  const debt = group.filter((e) => e.bal < 0).map((e) => ({ id: e.id, amt: -e.bal }));
  const byAmt = (a, b) => b.amt - a.amt || (a.id < b.id ? -1 : 1);
  const out = [];
  while (cred.length && debt.length) {
    cred.sort(byAmt);
    debt.sort(byAmt);
    const c = cred[0];
    const d = debt[0];
    const x = Math.min(c.amt, d.amt);
    out.push({ from: d.id, to: c.id, amount: x });
    c.amt -= x;
    d.amt -= x;
    if (c.amt === 0) cred.shift();
    if (d.amt === 0) debt.shift();
  }
  return out;
}
