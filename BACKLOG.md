# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

### 033 · Centralise Player State

Replace the ad-hoc `playerState` object and scattered orchestrator variables with a
single `PlayerState` class (constructed once at game start, updated via named methods)
that owns all persistent game state. Pass it to scenes as one argument instead of
the current spread of individual parameters (fuel, credits, drive, location, etc.).
See `docs/features/033-centralise-player-state.md` for the full spec.

**Depends on:** 030

---

### 034 · Shared Game Orchestrator

Extract all game navigation logic into a shared `Game` class in `src/game/game.ts`,
reducing `src/main.ts` and `terminal.ts` to platform setup and a game loop only.
See `docs/features/034-shared-game-orchestrator.md` for the full spec.

**Depends on:** 033

---

### 031 · Cargo Trading

Introduce a persistent cargo hold, live trading (buy/sell) at any trader, and a
read-only Cargo scene accessible from the Ship screen. Trader stock is randomly
generated on first visit and refreshes every 2 minutes. Buying transfers the entire
available lot to the hold; selling transfers all held units of a type back to the
trader. Prices are fixed at commodity base prices for now.
See `docs/features/031-cargo-trading.md` for the full spec.

**Depends on:** 029, 030, 033

---

### 032 · Modal Input Dialog

Introduce a `ModalInputDialog` component that overlays a numeric-input form on any
`BaseMenuScene` subclass. Replace the one-shot buy-all/sell-all mechanic (031) and
the full-refuel mechanic (030) with dialogs that let the player choose an exact quantity
or litre count. Add `TAB` to `GameAction` and `onCharInput` to `InputHandler` to support
typed digit entry and Tab-key focus cycling in both platform handlers.
See `docs/features/032-modal-input-dialog.md` for the full spec.

**Depends on:** 031

---

### 020 · World Data File Loader

Replace the static `WORLD` object in `world-data.ts` with a loader that parses
`docs/world/**/*.md` via `gray-matter`. Browser build uses Vite `import.meta.glob`
(bundled at compile time); terminal build uses Bun fs reads. A shared
`world-parser.ts` maps snake_case front matter to camelCase TypeScript types and
extracts `description` from markdown body text. Both paths call `initWorld()` in
their respective entry points; `src/tests/setup.ts` is updated so all Vitest tests
have world data initialised automatically.
See `docs/features/020-world-file-loader.md` for the full spec.

**Depends on:** 018, 019

---

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
