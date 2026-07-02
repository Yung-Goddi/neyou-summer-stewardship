# Changelog

Internal changelog for the Neyou Summer Stewardship System. Not user-facing -
see README.md for the current feature set.

## 2026-07-02 — Remove placeholder balances, add real account setup

- Removed the developer demo ledger (weekly splits, ice cream purchase,
  corrections, birthday gift, achievement reward, $5,000 Future snapshot)
  that shipped as the default starting balances.
- Added "Initialize Child Account" (Manage / Config) to set the official
  starting Spend/Save/Give/Future/External balances; applies immediately
  and is remembered for future resets.
- Extended Balance Controls (Money Actions) to cover all five accounts,
  not just Spend/Save/Give.
- Added Quick Reset ("Reset Child Balances") with a confirm-then-choose
  flow: reset all five balances to zero, or back to the saved starting
  point.
- Initialized the default seed account at Spend $4.00 / Save $4.00 /
  Give $2.00 / Future $0.00 / External $0.00 (Total $10.00), per request.
- Confirmed resets and re-initialization never touch chores, approvals,
  achievements, or badges.
- Confirmed tests pass (91/91) and production build succeeds.

## 2026-07-02 — Chore frequency, balance controls, badge system

- Fixed chore frequency controls.
- Added balance edit and reset controls.
- Added parent-controlled badge system.
- Added 7 badge categories and 35 starter badges.
- Confirmed secret badges stay hidden until earned.
- Confirmed resets do not erase chores, badges, or history.
- Confirmed tests pass and production build succeeds.
