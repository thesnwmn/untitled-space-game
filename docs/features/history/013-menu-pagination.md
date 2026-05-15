# 013 · Menu Pagination — CANCELLED

## What it added
Specified a reusable `Pager` component for paginating `MissionBoardScene` and `TraderScene` item lists when content exceeds the visible area. The pager bar would show `< Page N/X >` at the bottom of the content region, with LEFT/RIGHT navigation on the Mission Board and PAGE_UP/PAGE_DOWN on the Trader (where LEFT/RIGHT is already used for tab switching).

## Key files
- (never implemented)

## Architectural decisions embedded
- Superseded by feature 028 (Common Screen Layout), which integrated pagination directly into `BaseMenuScene` using a `|<|` / `|>|` indicator with `PAGE_UP`/`PAGE_DOWN` and `[`/`]` keys. The separate `Pager` class was never built.
