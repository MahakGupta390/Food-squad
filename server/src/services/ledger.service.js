import { Debt } from '../models/Debt.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { simplifyDebts } from './settlement.js';
import { HttpError } from '../utils/http.js';

/** All debt edges in the connected neighbourhood of `userId` (debts minus payments). */
async function loadEdges(userId) {
  const ids = new Set([String(userId)]);
  let frontier = [String(userId)];
  for (let round = 0; round < 10 && frontier.length; round++) {
    const rows = await Debt.find(
      { $or: [{ debtorId: { $in: frontier } }, { creditorId: { $in: frontier } }] },
      { debtorId: 1, creditorId: 1 },
    ).lean();
    frontier = [];
    for (const r of rows) {
      for (const id of [String(r.debtorId), String(r.creditorId)]) {
        if (!ids.has(id)) {
          ids.add(id);
          frontier.push(id);
        }
      }
    }
  }
  const list = [...ids];
  const [debts, payments] = await Promise.all([
    Debt.find({ debtorId: { $in: list } }).lean(),
    Payment.find({ fromId: { $in: list } }).lean(),
  ]);
  return [
    ...debts.map((d) => ({ from: String(d.debtorId), to: String(d.creditorId), amount: d.amount })),
    // a payment X -> Y is the reverse debt "Y owes X"
    ...payments.map((p) => ({ from: String(p.toId), to: String(p.fromId), amount: p.amount })),
  ];
}

export async function getPlanFor(userId) {
  const edges = await loadEdges(userId);
  return simplifyDebts(edges);
}

const txnId = (t) => `${t.from}:${t.to}:${t.amount}`;

/** Shape used by the dashboard: KPIs + the ledger rows the UI renders. */
export async function getDashboardLedger(userId) {
  const me = String(userId);
  const plan = (await getPlanFor(me)).filter((t) => t.from === me || t.to === me);
  const recent = await Payment.find({ $or: [{ fromId: userId }, { toId: userId }] })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const ids = new Set();
  plan.forEach((t) => (ids.add(t.from), ids.add(t.to)));
  recent.forEach((p) => (ids.add(String(p.fromId)), ids.add(String(p.toId))));
  const users = await User.find({ _id: { $in: [...ids] } }, { name: 1 }).lean();
  const nameOf = Object.fromEntries(users.map((u) => [String(u._id), u.name]));

  const open = plan.map((t) => ({
    id: txnId(t),
    text: t.to === me ? `${nameOf[t.from]} owes you` : `You owe ${nameOf[t.to]}`,
    amt: t.amount,
    member: t.to === me ? t.from : t.to,
    settled: false,
  }));
  const done = recent.map((p) => ({
    id: `paid:${p._id}`,
    text: String(p.toId) === me ? `${nameOf[String(p.fromId)]} paid you` : `You paid ${nameOf[String(p.toId)]}`,
    amt: p.amount,
    member: String(p.toId) === me ? String(p.fromId) : String(p.toId),
    settled: true,
  }));

  return {
    owed: plan.filter((t) => t.to === me).reduce((a, t) => a + t.amount, 0),
    owe: plan.filter((t) => t.from === me).reduce((a, t) => a + t.amount, 0),
    ledger: [...open, ...done],
  };
}

/** Settle one suggested payment. The plan is recomputed, so a stale click can't pay the wrong amount. */
export async function settleLedgerItem(user, id) {
  const me = String(user._id);
  const plan = await getPlanFor(me);
  const txn = plan.find((t) => txnId(t) === id && (t.from === me || t.to === me));
  if (!txn) throw new HttpError(409, 'That balance changed, refreshing…');
  await Payment.create({ fromId: txn.from, toId: txn.to, amount: txn.amount, source: 'ledger' });
}

/** What `debtor` still owes `creditor` directly (debts both ways minus payments both ways). */
export async function pairOutstanding(debtorId, creditorId) {
  const [d1, d2, p1, p2] = await Promise.all([
    Debt.find({ debtorId, creditorId }, { amount: 1 }).lean(),
    Debt.find({ debtorId: creditorId, creditorId: debtorId }, { amount: 1 }).lean(),
    Payment.find({ fromId: debtorId, toId: creditorId }, { amount: 1 }).lean(),
    Payment.find({ fromId: creditorId, toId: debtorId }, { amount: 1 }).lean(),
  ]);
  const sum = (rows) => rows.reduce((a, r) => a + r.amount, 0);
  return sum(d1) - sum(d2) - sum(p1) + sum(p2);
}
