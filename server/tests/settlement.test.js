import test from 'node:test';
import assert from 'node:assert/strict';
import { simplifyDebts } from '../src/services/settlement.js';

const netOf = (edges) => {
  const b = {};
  for (const { from, to, amount } of edges) {
    b[to] = (b[to] || 0) + amount;
    b[from] = (b[from] || 0) - amount;
  }
  return b;
};
const nonZero = (b) => Object.fromEntries(Object.entries(b).filter(([, v]) => v !== 0));
const applyPayments = (edges, txns) =>
  nonZero(netOf([...edges, ...txns.map((t) => ({ from: t.to, to: t.from, amount: t.amount }))]));

test('payments clear every balance', () => {
  const edges = [
    { from: 'A', to: 'B', amount: 100 },
    { from: 'B', to: 'C', amount: 100 },
    { from: 'C', to: 'D', amount: 40 },
    { from: 'D', to: 'A', amount: 10 },
  ];
  assert.deepEqual(applyPayments(edges, simplifyDebts(edges)), {});
});

test('chain A->B->C collapses to A->C', () => {
  const txns = simplifyDebts([
    { from: 'A', to: 'B', amount: 100 },
    { from: 'B', to: 'C', amount: 100 },
  ]);
  assert.deepEqual(txns, [{ from: 'A', to: 'C', amount: 100 }]);
});

test('unrelated groups are not mixed together', () => {
  const txns = simplifyDebts([
    { from: 'A', to: 'B', amount: 100 },
    { from: 'C', to: 'D', amount: 100 },
  ]);
  assert.deepEqual(txns.map((t) => t.from + t.to).sort(), ['AB', 'CD']);
});

test('opposite debts cancel', () => {
  assert.deepEqual(
    simplifyDebts([
      { from: 'A', to: 'B', amount: 100 },
      { from: 'B', to: 'A', amount: 100 },
    ]),
    [],
  );
});

// Brute force: min payments = people - (max number of disjoint zero-sum groups)
function bruteMinTxns(bals) {
  const n = bals.length;
  let best = 0;
  const go = (mask, groups) => {
    if (mask === 0) {
      best = Math.max(best, groups);
      return;
    }
    const low = mask & -mask;
    for (let sub = mask; sub; sub = (sub - 1) & mask) {
      if (!(sub & low)) continue;
      let s = 0;
      for (let i = 0; i < n; i++) if (sub & (1 << i)) s += bals[i];
      if (s === 0) go(mask ^ sub, groups + 1);
    }
  };
  go((1 << n) - 1, 0);
  return n - best;
}

test('matches brute-force optimum on random connected debt graphs', () => {
  let seed = 12345;
  const rnd = (m) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff), seed % m);
  for (let t = 0; t < 200; t++) {
    const people = 3 + rnd(5); // 3..7
    const name = (i) => String.fromCharCode(65 + i);
    const edges = [];
    // spanning chain (each pair once => connected, no cancelling pairs)
    for (let i = 0; i + 1 < people; i++) {
      const amount = 10 * (1 + rnd(15));
      edges.push(rnd(2) ? { from: name(i), to: name(i + 1), amount } : { from: name(i + 1), to: name(i), amount });
    }
    for (let i = 0; i < people; i++) {
      for (let j = i + 2; j < people; j++) {
        if (rnd(10) < 4) {
          const amount = 10 * (1 + rnd(15));
          edges.push(rnd(2) ? { from: name(i), to: name(j), amount } : { from: name(j), to: name(i), amount });
        }
      }
    }
    const txns = simplifyDebts(edges);
    assert.deepEqual(applyPayments(edges, txns), {});
    const bals = Object.values(nonZero(netOf(edges)));
    assert.equal(txns.length, bruteMinTxns(bals), `case ${t}`);
  }
});
