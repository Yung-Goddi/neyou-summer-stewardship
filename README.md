# Neyou Summer Stewardship System

A Summer 2026 money stewardship notebook. Single device, no login, no backend —
just a trustworthy ledger engine and a tablet-friendly screen to exercise it.

Phase 0 (project scaffold) and Phase 1 (stewardship engine) are complete.
Everything past that — Parent Dashboard, child experience, responsibilities,
achievements, badges, navigation, real styling — is intentionally not built yet.

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

## Project structure

```
src/
  engine/     Pure, React-free money engine (the source of truth)
  storage/    localStorage persistence layer
  data/       Seed data for development/testing
  dev/        Temporary developer testing screen (not the final UI)
  App.jsx     Currently just renders the dev testing page
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

See `src/dev/DevTestingPage.jsx` for a working example of every engine
function in use.

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Config already checked in at `netlify.toml`
