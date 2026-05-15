# Backlog

Items are ordered by priority. The Engineer always takes the top READY item.
Completed items are in [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md).

## Statuses
- READY — fully specified, dependencies met, ready to build
- NEEDS SPEC — idea captured, Designer needs to flesh it out
- IN PROGRESS — currently being built (should only ever be one of these)

---

## READY

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

### 035 · Landing/Take-Off Animations and Terminology

Replace dock/undock with land/take-off for surface and asteroid destinations,
add distinct text-based landing and take-off animations for each type, and
unify all animation scenes behind a shared `BaseTransitionScene` that keeps
the screen chrome visible with context-aware header labels.
See `docs/features/035-landing-take-off-animations.md` for the full spec.

---

## NEEDS SPEC

_(none)_

---

## IN PROGRESS

_(none)_

---

## DONE

See [BACKLOG_HISTORY.md](BACKLOG_HISTORY.md) for all completed items.
