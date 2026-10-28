import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBill, allocateProportional, splitEven } from '../src/services/split.js';

const pricing = { taxRate: 0.05, deliveryFee: 50, squadDiscount: 100 };

test('splitEven never loses paise', () => {
  const parts = splitEven(10001, ['c', 'a', 'b']);
  assert.equal(Object.values(parts).reduce((a, b) => a + b, 0), 10001);
});

test('shares always sum exactly to total (property test)', () => {
  for (let t = 0; t < 500; t++) {
    const ids = ['a', 'b', 'c', 'd', 'e'].slice(0, 2 + (t % 4));
    const cart = Array.from({ length: 1 + (t % 6) }, (_, i) => ({
      price: 40 + ((t * 37 + i * 91) % 400),
      qty: 1 + ((t + i) % 5),
      eaters: ids.filter((_, k) => (t + i + k) % 3 !== 0),
    }));
    const bill = computeBill({ cart, memberIds: ids, pricing });
    const sum = Object.values(bill.shares).reduce((a, b) => a + b, 0);
    assert.equal(sum, bill.total);
    assert.ok(Object.values(bill.shares).every((v) => Number.isInteger(v) && v >= 0));
  }
});

test('person who ate nothing pays nothing', () => {
  const bill = computeBill({
    cart: [{ price: 300, qty: 1, eaters: ['a', 'b'] }],
    memberIds: ['a', 'b', 'c'],
    pricing,
  });
  assert.equal(bill.shares.c, 0);
  assert.equal(bill.shares.a + bill.shares.b, bill.total);
});

test('empty cart is all zeros', () => {
  const bill = computeBill({ cart: [], memberIds: ['a', 'b'], pricing });
  assert.deepEqual([bill.total, bill.fee, bill.disc, bill.shares.a], [0, 0, 0, 0]);
});

test('allocateProportional is deterministic', () => {
  const a = allocateProportional(100, { x: 1, y: 1, z: 1 });
  const b = allocateProportional(100, { z: 1, y: 1, x: 1 });
  assert.deepEqual(a, b);
  assert.equal(a.x + a.y + a.z, 100);
});
