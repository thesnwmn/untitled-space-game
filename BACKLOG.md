# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

### 025 · Randomise Station Star Patterns

Each visit to a destination generates a new random `Starfield` seed, producing a
unique star layout. The seed is preserved across dock/undock cycles at the same
destination and only cleared when the player fully navigates away (main menu, story
screen, or future jump). `ShipScene` gains a required `starfieldSeed: number`
constructor parameter. The orchestrators (`main.ts`, `terminal.ts`) hold a
`destinationSeed` variable: generated fresh on first `goToShip` when null, reused
on subsequent undocks, cleared on `goToMainMenu` / `goToStory`.
See `docs/features/025-randomise-station-star-patterns.md` for the full spec.

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

See [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md) for all completed items.
