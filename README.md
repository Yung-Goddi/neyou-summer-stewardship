# Neyou Summer Stewardship System

A Summer 2026 money stewardship notebook. Single device, no backend — a
trustworthy ledger engine, a kid-friendly home screen, and a PIN-gated
Parent Dashboard sharing one live state.

Phase 0 (project scaffold), Phase 1 (stewardship engine), Phase 2 (Parent
Dashboard), Phase 3 (child UI), and Phase 3.1 (usability refinements -
undo, savings goal, badge gallery, real responsibilities, giving
categories, warmer styling) are complete. Money-practice/education
screens are intentionally not built yet.

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

The app opens on the child home screen (no PIN). Default parent PIN in
the seed data is **1234** — change it under Manage → Change Parent PIN
before real use.

## Project structure

```
src/
  engine/     Pure, React-free money + approvals engine (the source of truth)
  storage/    localStorage persistence layer
  data/       Seed data for development/testing
  dev/        Legacy raw engine testing screen (not part of the app flow)
  parent/     Parent Dashboard: PIN gate, operator picker, and five screens
  child/      Child home screen, money requests, task submission
  AppShell.jsx  Owns root state; switches between child and parent modes
  App.jsx     Renders AppShell
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
  latest event for a given `(kind, itemId, date)`. A parent's self-serve
  flow (no child involved) appends straight to `'approved'`; the child UI
  appends `'pending'` first — same mechanism, same screen acts on either.
  Approving an achievement with a reward auto-posts the Achievement
  Reward transfer and links it back via `transferId`.
- **Money requests** (`src/engine/moneyRequests.js`) are how a child asks
  to Spend, Save Transfer, or Give: `createMoneyRequest` only ever
  appends a `'pending'` approval event (`kind: 'money_request'`) with the
  request's type/amount/route in its `payload` - nothing moves in the
  ledger until a parent approves it, which is what actually calls
  `transferBetweenAccounts` (so the usual negative-balance protection
  still applies at that moment, even if the balance changed since the
  request was made).
- **PIN is a soft deterrent, not real security** (`src/engine/pin.js`): one
  shared PIN, SHA-256 hashed before storage, no salt or rate limiting.
  Picking Dad/Mom after unlocking doesn't authenticate anything - it just
  sets who shows up in `approvedBy`. The child side has no PIN at all.

See `src/dev/DevTestingPage.jsx` for a working example of every core money
engine function in use, and `src/AppShell.jsx` for how the real UI wires
the same engine functions together for both the child and parent sides.

## The app (`src/AppShell.jsx`)

Owns the one root state object and switches between two modes that share
it live - nothing goes stale moving between them:

**Child mode (default, no PIN)** — `src/child`
- **Home** — mascot greeting, balances, a savings-goal progress bar (one
  active goal, progress = the live Save balance), big colorful
  Spend/Save/Give request buttons, an "I Did My Jobs Today!" button, a
  "My Badges" button, and a list of what's still waiting for approval -
  each with an **Undo** button while it's still pending
- **Money request** — shared screen for Spend/Save Transfer/Giving
  (Giving also picks a category - Church, Charity, etc.); submitting
  only appends a pending approval event, never touches the ledger
  directly
- **Tasks** — mark today's responsibilities/achievements done (also just
  appends a pending approval event), each with its own inline Undo while
  still pending
- **Badges** — Earned/Locked gallery of achievements (icon, description,
  reward) - a visual board, not a new reward mechanism
- A small link at the bottom switches to the Parent Dashboard

**Parent mode (PIN gated)** — `src/parent`

PIN gate → operator picker (Dad/Mom) → tabbed dashboard:

- **Dashboard** — balances, open-approvals count for today, recent activity
- **Approvals** — a Money Requests section for anything a child asked to
  spend/save/give (Approve posts the real ledger transfer; Reject just
  logs it), plus responsibilities/achievements showing none/pending/
  approved per day - pending items show "waiting on you" with Approve/Reject
- **Money** — weekly split, parent bonus, parent deposit, parent
  withdrawal (warns before overdrawing), record-a-real-world-transaction,
  correction
- **Future** — record a Future account statement snapshot + history
- **Manage** — settings, operator/responsibility/achievement (icon,
  description, reward) editors, giving-category editor, savings-goal
  editor, change PIN, export/import/reset

No money-practice/education screens yet. The illustrated Neyou mascot
character art (reference sheets provided outside this repo) isn't wired
in as real assets yet - the child screens use a `neyou.*` color palette
extracted from those sheets (`tailwind.config.js`) plus an emoji-avatar
placeholder (`MascotBubble` in `src/child/childUi.jsx`) until the actual
artwork is added as project files (e.g. dropped into `public/mascot/`).

## Tests

```bash
npm test
```

52 Vitest tests cover integer cents math, exact weekly-split summing,
linked transfer pairs, negative-balance blocking vs. warning behavior,
correction reason enforcement, export/import round-tripping, Future
account snapshot semantics, the approvals append-only log (including the
money-request payload, kind-wide latest-event lookup, withdrawal, and
hasEverBeenApproved for badges), money request creation/routing
(including giving categories), and PIN hashing.

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Config already checked in at `netlify.toml`
