# Feature 061 · Economic Supply & Demand

## Goal

Trading at each star system reflects local economic specialization — systems that produce a commodity price it cheaply and stock it readily, while systems that need it price it high and rarely stock it, giving players a clear incentive to haul goods across jump routes.

---

## Acceptance criteria

- `docs/world/economies.md` exists, defining one entry per economy currently used in system data; each entry has `id`, `summary`, and a `commodities` list of `{id, factor}` pairs.
- `WorldData` has an `economies` array populated by `initWorld`.
- `StarSystem.economy` is renamed to `StarSystem.economies` (type unchanged: `string[]`); all system doc front matter, the parser, and all call sites updated.
- `Destination.goodsBias` is removed from the type definition, world parser, all destination doc front matter, and all call sites; no tests reference it.
- Commodity stock selection is biased by the system's economies: commodities with effective factor < 1.0 are weighted more likely in generated stock; commodities with factor > 1.0 are weighted less likely.
- Buy and sell prices follow: `price = basePrice × clamp(effectiveFactor, minFactor, maxFactor) × reputationModifier`.
- `GameBalance` includes `economies.minFactor` and `economies.maxFactor`, defaulting to 0.75 and 1.25.
- Supply mission commodity selection uses economies: commodities with above-1.0 effective factor at the destination's system are preferred candidates (the system needs them delivered), falling back to all legal commodities if no economies apply.
- `npx tsc --noEmit` passes with zero errors; `npm test` passes with tests covering factor averaging, clamping, stock weighting, and price calculation.

---

## Out of scope

- Destination-level economy overrides (all destinations in a system share the same factors).
- Any player-facing UI displaying supply/demand information.
- Legality enforcement by economy entries (legal/illegal status stays on `Commodity`).
- Dynamic economy shifts over time.

---

## Technical notes

### New `Economy` type

Add to `src/game/world/types.ts`:

```
id:          string    // must match an id used in StarSystem.economies
summary:     string    // e.g. "Raw ore extraction and heavy mineral processing"
commodities: { id: string; factor: number }[]
```

`WorldData` gains `economies: Economy[]`. `GameBalance` gains `economies: { minFactor: number; maxFactor: number }`.

### Effective factor calculation

For a commodity at a given system:

1. Collect all `Economy` entries whose `id` is in `system.economies`.
2. Gather every `factor` from those entries where the commodity id matches.
3. Average them. If no match, effective factor = 1.0.
4. Clamp to `[balance.economies.minFactor, balance.economies.maxFactor]`.

This should be a pure helper function — no side effects, easily unit-tested. Authored factor values in `economies.md` may exceed the balance clamp range intentionally; this lets authors express relative intensity between economies (a dedicated mining economy vs. a mixed system both authoring lower factors for ore, with the runtime clamp keeping prices sane).

### Price formula

Extend the existing trader price (currently `basePrice × reputationModifier`) to:
`basePrice × clamp(effectiveFactor, minFactor, maxFactor) × reputationModifier`.

The effective factor is computed once during stock generation and stored per stock item so `TraderScene` reads it rather than re-deriving it each render.

### Stock generation

Feature 062 (Reputation-Scaled Trader Inventory) adjusts the stock count and quantity ranges before this feature runs. The weighted commodity selection here operates on the reputation-adjusted count range, not raw `stockCountMin`/`stockCountMax` balance values directly. Effective factor is an inverse probability weight — lower factor increases selection likelihood, higher decreases it. The Engineer chooses the exact weighting function. Each stock item stores its effective factor for use at price render time.

### Removing `goodsBias`

Remove from: `Destination` interface, world parser, all `docs/world/destinations/*.md` front matter, and `mission-generator.ts`.

The mission generator currently does a category-keyword match against `goodsBias`. Replace with: collect commodities whose effective factor at the destination's system exceeds 1.0; use those as supply mission candidates. `destination.system` holds the system id; use it to look up the `StarSystem` and derive the effective factors.

### Renaming `StarSystem.economy`

Rename the field from `economy` to `economies` in:
- `src/game/world/types.ts` (`StarSystem` interface)
- `src/game/world/world-parser.ts` (YAML key and parsed field)
- All `docs/world/systems/*.md` front matter
- Any call sites that read `system.economy`

### World data file

`docs/world/economies.md` front matter contains an `economies` array. Every id present in any system doc's `economies` array must have an entry. From current system data: `industrial`, `administrative`, `military`, `salvage`, `black-market`, `scavenging`, `mining`. Also add `trade` and `shipping` (currently only in destination `goodsBias` fields, which are being removed).

> suggestion — exact factors are content decisions; these illustrate the pattern:
> - `mining`: iron-ore 0.5, rare-earth 0.6, deuterium 0.75, refined-metals 1.2, ship-components 1.3, rations 1.15
> - `industrial`: refined-metals 0.7, ship-components 0.75, electronics 0.8, fuel-cells 0.8, iron-ore 0.85
> - `administrative`: electronics 0.85, rations 0.9, medical-supplies 0.9, ship-components 1.1
> - `military`: ship-components 0.85, fuel-cells 0.85, rations 0.85, medical-supplies 0.85
> - `salvage`: iron-ore 0.7, refined-metals 0.75, ship-components 0.7, electronics 0.8, medical-supplies 1.25, rations 1.2
> - `black-market`: combat-stims 0.6, black-box-data 0.7, grey-market-tech 0.65, rations 1.1, medical-supplies 1.15
> - `scavenging`: iron-ore 0.75, ship-components 0.75, electronics 0.85, rations 1.3, medical-supplies 1.3
> - `trade`: electronics 0.85, rations 0.85, refined-metals 0.9, fuel-cells 0.85
> - `shipping`: fuel-cells 0.8, rations 0.85, ship-components 0.9, deuterium 0.85

---

## Play-test instructions

### Browser (`npm run dev`)

1. Dock at a station in a mining system (e.g. Epsilon Eridani). Open the trader.
2. Confirm iron ore and rare earth elements appear in stock and are priced below their base values.
3. Confirm ship components and refined metals are priced above base (the system needs them).
4. Travel to an industrial system (e.g. Sol). Confirm refined metals and ship components are now cheaper; raw ores cost more.
5. Compare the same commodity price across two systems to verify the spread.
6. Visit the mission board and confirm supply missions request commodities the system needs (above-1.0 factor goods).

### Terminal (`npm run terminal`)

Repeat all steps using keyboard navigation.

---

## Dependencies

Feature 052 (Reputation — Trade Effects) — complete.
Feature 062 (Reputation-Scaled Trader Inventory) — must be built first; provides the reputation-adjusted count range that this feature's weighted selection operates on.
