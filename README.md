# Neyou Summer Stewardship System

A Summer 2026 money stewardship notebook. Single device, no backend — a
trustworthy ledger engine plus a PIN-gated Parent Dashboard on top of it.

Phase 0 (project scaffold), Phase 1 (stewardship engine), and Phase 2
(Parent Dashboard) are complete. The child-facing experience,
badges/gamification, and money-practice UI are intentionally not built yet.

## Stack

- Vite + React
- Tailwind CSS
- Browser `localStorage` for persistence (no backend, no database)
- Installable as a home-screen web app (`public/manifest.webmanifest`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
```

Default parent PIN in the seed data is **1234** — change it under
Manage → Change Parent PIN before real use.

## Project structure

```
src/
  engine/     Pure, React-free money + approvals engine (the source of truth)
  storage/    localStorage persistence layer
  data/       Seed data for development/testing
  dev/        Legacy raw engine testing screen (not part of the app flow)
  parent/     Parent Dashboard: PIN gate, operator picker, and five screens
  App.jsx     Renders ParentApp (src/parent/ParentApp.jsx)
```

## The engine (`src/engine`)

- **Money is always an integer number of cents.** No floats, anywhere.
- **The ledger is append-only.** Nothing is ever edited or deleted; mistakes
  are fixed with a new `correction` entry that requires a reason.
- **Balances are never stored.** `calculateBalance` derives them from the
  ledger every time. The Future account is the one exception: it's tracked
  by real-world statement snapshots, not by summing transfers.
- Every ordinary money movement (Spend, Save Transfer, Giving, Weekly
  Income, Achievement Reward, Parent Bonus, Parent Deposit, Parent
  Withdrawal) is a linked pair of ledger entries — one `out` leg and one
  `in` leg sharing a `transferId` — so the ledger always shows both sides.
- **Negative balances are blocked for child-facing spending, never for
  parent overrides.** Spend, Save Transfer, Giving, Weekly Income,
  Achievement Reward, and Parent Bonus can never take Spend/Save/Give
  below zero — `transferBetweenAccounts` throws. Parent Withdrawal and
  Correction are administrative overrides: they're allowed to go negative,
  but `validateTransaction` returns a non-blocking warning
  (`previewNegativeImpact`) so the UI can ask a human to confirm first.
- **Approvals are also an append-only log** (`src/engine/approvals.js`),
  mirroring the ledger's own design: "approving" something appends a new
  event rather than editing a row, and the current status is always the
  latest event for a given `(kind, itemId, date)`. Phase 2's parent
  self-serve flow appends straight to `'approved'`; a future child
  submission flow would append `'pending'` first — same mechanism either
  way. Approving an achievement with a reward auto-posts the Achievement
  Reward transfer and links it back via `transferId`.
- **PIN is a soft deterrent, not real security** (`src/engine/pin.js`): one
  shared PIN, SHA-256 hashed before storage, no salt or rate limiting.
  Picking Dad/Mom after unlocking doesn't authenticate anything - it just
  sets who shows up in `approvedBy`.

See `src/dev/DevTestingPage.jsx` for a working example of every core money
engine function in use, and `src/parent/ParentApp.jsx` for how the real UI
wires the same engine functions together.

## The Parent Dashboard (`src/parent`)

PIN gate → operator picker (Dad/Mom) → tabbed dashboard:

- **Dashboard** — balances, open-approvals count for today, recent activity
- **Approvals** — mark responsibilities/achievements done for a given date;
  achievement approval posts the reward automatically
- **Money** — weekly split, parent bonus, parent deposit, parent
  withdrawal (warns before overdrawing), record-a-real-world-transaction,
  correction
- **Future** — record a Future account statement snapshot + history
- **Manage** — settings, operator/responsibility/achievement editors,
  change PIN, export/import/reset

No child-facing UI exists yet.

## Tests

```bash
npm test
```

38 Vitest tests cover integer cents math, exact weekly-split summing,
linked transfer pairs, negative-balance blocking vs. warning behavior,
correction reason enforcement, export/import round-tripping, Future
account snapshot semantics, the approvals append-only log, and PIN hashing.

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Config already checked in at `netlify.toml`
