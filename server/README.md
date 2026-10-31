# FoodSquad API

Express 5 · MongoDB (Mongoose 9) · Socket.IO · JWT sessions

```bash
cp .env.example .env     # fill MONGO_URI and JWT_SECRET
npm install
npm run dev              # restaurants are seeded automatically on first start
npm test                 # unit + flow tests (no database needed)
```

## Endpoints (all under `/api`, JSON; room is picked by the `x-room-code` header)
| | |
|---|---|
| `POST /session {name}` | guest sign-in, returns `{ token }` |
| `GET /state` | full snapshot the UI renders (`me`, `room`, `members`, `menu`, `cart`, `calc`, `paid`, `dashboard`) |
| `POST /restaurant/select {id}` | create (or reuse an empty) room hosted by you |
| `POST /rooms/join {code}` | join by room code |
| `POST /prefs {budget,diet,mood,dislikes}` | save your preferences |
| `POST /cart/add {name}` · `/cart/qty {lineId,delta}` · `/cart/eat {lineId,member}` | shared cart |
| `GET /agent` · `POST /agent/accept` | diet/budget-aware recommendations; accept (host) pushes them into the cart |
| `POST /order/place` | host only; freezes the bill and creates one debt per member |
| `POST /paid {id}` | host confirms a member paid |
| `POST /ledger/settle {id}` | settle one suggested payment on the dashboard |

## Design decisions worth explaining in an interview
- **Exact money.** Cart lines split in paise; the final total is allocated to people with the
  largest-remainder method, so shares always sum to the invoice to the rupee (property-tested).
- **Server-side prices.** The client sends an item name; the price always comes from the menu.
- **Concurrent edits.** Rooms use Mongoose optimistic concurrency (`__v`) with automatic retry,
  so two people tapping at once never overwrite each other.
- **Idempotent ordering.** `open → placed` is a single conditional update, and a unique index on
  `(roomId, debtorId)` makes double charging impossible.
- **Ledger = debts − payments.** Nothing is mutated, every rupee has an audit trail.
- **Debt minimisation.** People are grouped by who currently owes whom, then each group is solved
  exactly (bitmask DP for ≤14 people) to find the fewest payments; verified against brute force.
- **Agent.** Hard constraints (diet, allergies, dislikes, budget) are enforced in code before any
  model sees the menu, and the output is re-validated. An LLM can later re-rank survivors only.

## Deploy (Render)
Root directory `server`, build `npm install`, start `npm start`. Env: `MONGO_URI`, `JWT_SECRET`,
`CLIENT_URL` (your Vercel URL, comma-separate extras), `NODE_ENV=production`.
In Atlas, **Network Access** must allow Render (0.0.0.0/0 for a demo).
