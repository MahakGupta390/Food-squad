import test from 'node:test';
import assert from 'node:assert/strict';
import { recommend, blockReason, validateAgentOutput } from '../src/services/agent.js';

const pricing = { taxRate: 0.05, deliveryFee: 50, squadDiscount: 100 };
const menu = [
  { id: 'm1', name: 'Paneer Tikka', price: 329, category: 'Starters', veg: true, desc: 'tandoori paneer' },
  { id: 'm2', name: 'Chicken Seekh Kebab', price: 379, category: 'Starters', veg: false, desc: 'minced chicken' },
  { id: 'm3', name: 'Dal Makhani', price: 299, category: 'Mains', veg: true, desc: 'black lentils' },
  { id: 'm4', name: 'Egg Curry', price: 250, category: 'Mains', veg: false, desc: 'eggs', tags: ['egg'] },
  { id: 'm5', name: 'Gulab Jamun', price: 149, category: 'Desserts', veg: true, desc: 'khoya' },
];
const members = [
  { id: 'u1', name: 'Mahak', budget: 450, diet: ['Veg'], mood: 'Spicy', dislikes: '' },
  { id: 'u2', name: 'Aman', budget: 500, diet: ['Non-veg'], mood: 'Comfort Food', dislikes: '' },
  { id: 'u3', name: 'Riya', budget: 400, diet: ['Veg', 'Egg-free'], mood: 'Light', dislikes: 'jamun' },
];

test('veg members never get non-veg items', () => {
  assert.equal(blockReason(members[0], menu[1]), 'non-veg');
  const out = recommend({ menu, members, pricing });
  for (const r of out.recommendations) {
    const item = menu.find((i) => i.id === r.menuItemId);
    if (!item.veg) assert.ok(!r.eaters.includes('u1') && !r.eaters.includes('u3'));
  }
});

test('dislikes are hard-blocked per person', () => {
  const out = recommend({ menu, members, pricing });
  const jamun = out.recommendations.find((r) => r.name === 'Gulab Jamun');
  if (jamun) assert.ok(!jamun.eaters.includes('u3'));
  assert.equal(blockReason(members[2], menu[4]), 'dislikes jamun');
});

test('everyone stays within budget', () => {
  const out = recommend({ menu, members, pricing });
  assert.ok(Object.values(out.perPerson).every((p) => !p.over));
});

test('validator rejects tampered output', () => {
  const out = recommend({ menu, members, pricing });
  const bad = structuredClone(out);
  bad.recommendations.push({ menuItemId: 'm2', name: 'Chicken Seekh Kebab', price: 379, eaters: ['u1'] });
  assert.throws(() => validateAgentOutput(bad, menu, members));
  const bad2 = structuredClone(out);
  bad2.recommendations[0].price = 1;
  assert.throws(() => validateAgentOutput(bad2, menu, members));
});

test('item nobody can eat is excluded with a reason', () => {
  const veg = members.map((m) => ({ ...m, diet: ['Veg'] }));
  const out = recommend({ menu, members: veg, pricing });
  assert.ok(out.excluded.some((e) => e.dish === 'Chicken Seekh Kebab'));
});
